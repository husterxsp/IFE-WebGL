### 任务目的

在这一题中，你将了解到着色器的相关知识，并且实现一个简单的卡通着色器。

### 任务描述

+ 学习[《Three.js 入门指南》](http://www.ituring.com.cn/article/47975)第 9 章着色器；
+ 实现简单的卡通着色器。

![](../img/task7.png)

上图（图片来源：[Wikipedia](https://en.wikipedia.org/wiki/Cel_shading)）显示的是卡通渲染的例子，左图是茶壶面片的 wireframe，中间的图是用纯色着色器渲染的结果，右图是卡通渲染的结果。

实现的思路是，当亮度定为几个区间，在某个区间就用其对应的一个颜色去替代。[这里](http://www.neocomputer.org/projects/donut/)有几个例子，可以参考实现。上图中描边的效果可以根据自己的能力实现。