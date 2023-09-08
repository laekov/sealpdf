const SealPDFApp = {
	data() {
		return {
			sealText: "仅供内部参考",
			uploadText: "",
			tokenText: "或使用已有 PPT Token",
			output: [],
			pptToken: ''
		};
	},
	created() {
		this.postprefix = document.postprefix;
	},
	methods: {
		uploadpptx(evt) {
			var self = this;
			var reader = new FileReader();
			reader.addEventListener('load', (e) => {
				var t = btoa(reader.result);
				var chunk_size = 960 * 1024; // 960KB
				var total_chunks = Math.ceil(t.length / chunk_size);
				var current_offset = 0;
				var token = -1;
				var upload_start = Date.now();
				self.uploadText = "上传中";
				var promise = axios.post(this.postprefix + '/upload-pptx', {
						token: token,
						body: t.substr(0, chunk_size)
					});
				for (var i = 0; i + 1 < total_chunks; ++i) {
					promise = promise.then((res) => {
						if (token === -1) {
							token = res.data;
						} else if (token != res.data) {
							console.log('Wrong token received: ' + res.data);
						}
						++current_offset;
						self.uploadText = "上传进度 " + current_offset + "/" + total_chunks;
						return axios.post(this.postprefix + '/upload-pptx', {
							token: token,
							body: t.substr(current_offset * chunk_size, chunk_size),
						});
					});
				}
				promise = promise.then((res) => {
					if (token === -1) {
						token = res.data;
					}
					var elapsed_ms = Date.now() - upload_start;
					self.uploadText = "上传完成, 用时 "
						+ Math.round(elapsed_ms * 1e-3) + " s, 带宽 " 
						+ Math.round(t.length * 1e-6 / (elapsed_ms * 1e-3)).toFixed(2) + " MB/s";
					self.tokenText = "请慧存 PPT Token 以便重复使用";
					self.pptToken = token;
				});
			});
			this.uploadText = "读取文件中";
			if (evt.dataTransfer) {
				reader.readAsBinaryString(evt.dataTransfer.files[0]);
			} else {
				reader.readAsBinaryString(evt.target.files[0]);
			}
		},

		genpdf(evt) {
			var self = this;
			if (this.pptToken.length < 2) {
				alert("尚未上传或选择 ppt");
				return 1;
			}
			var state_wm = {class: 'info', text: "生成水印..."};
			var state_gp = {class: 'info', text: "pptx 转 pdf..."};
			var state_gm = {class: 'info', text: "pdf 加水印..."};
			this.output.unshift(state_wm);
			this.output.unshift(state_gp);
			var jobs = [
				axios.post(this.postprefix + "/generate-watermark", {
					watermark: this.sealText
				}).then((res) => {
					state_wm.text += res.data;
					state_wm.class = 'success';
					self.$forceUpdate();
				}).catch((err) => {
					state_wm.text += 'error';
					state_wm.class = 'danger';
					self.$forceUpdate();
					console.log(err);
				}),
				axios.post(this.postprefix + "/convert-to-pdf", {
					token: this.pptToken
				}).then((res) => {
					state_gp.text += res.data;
					state_gp.class = 'success';
					self.$forceUpdate();
				}).catch((err) => {
					state_gp.text += 'error';
					state_gp.class = 'danger';
					self.$forceUpdate();
					console.log(err);
				}),
			];
			Promise.all(jobs).then(() => {
				this.output.unshift(state_gm);
				return axios.post(this.postprefix + "/seal", {
					token: this.pptToken,
					watermark: this.sealText
				}).then((res) => {
					state_gm.text += "完成";
					state_gm.link = this.postprefix + '/get-output/' + res.data;
					state_gm.class = 'primary';
					state_gp.class = 'dark';
					state_wm.class = 'dark';
					self.$forceUpdate();
				});
			}).catch((err) => {
				console.log(err);
				this.output.unshift({
					class: 'danger',
					text: "生成错误!"
				});
			});
		},
	}
};

Vue.createApp(SealPDFApp).mount('#sealpdfapp');
