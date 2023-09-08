import matplotlib
import matplotlib.pyplot as plt
import sys


def gen(filename, txt):
    matplotlib.rcParams['font.sans-serif'] = ['SimHei']
    fig, ax = plt.subplots()
    fig.set_dpi(60)
    fig.set_size_inches(16, 9)
    for i in range(5):
        for j in range(4):
            ax.text(i * 240, j * 200, txt,
                    color='gray',
                    alpha=.2,
                    size=14,
                    horizontalalignment='center',
                    verticalalignment='center',
                    rotation=(-i * 3 + j * 4) * 10)
    ax.set_xlim(0, 960)
    ax.set_ylim(0, 540)
    plt.axis('off')
    plt.savefig(filename, transparent=True)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: genwatermark.py <filename> <text>")
        exit(1)
    else:
        gen(sys.argv[1], sys.argv[2])
