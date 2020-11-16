## 项目介绍
木兰湾管理系统是用于管理个人消费、锻炼、音乐、阅读、健康、饮食、人生经历等各个衣食住行信息的系统，通过提醒、计划模块利用调度系统来统计分析执行情况。
并通过积分和评分体系来综合评估个人的总体状态。

该系统是前后端分离的项目，当前项目mulanbay-ui-vue为前端PC版本，需要结合后端项目才能完整访问。

木兰湾管理系统后端项目：
* 服务器端[mulanbay-server](https://gitee.com/mulanbay/mulanbay-server)

木兰湾管理系统其他前端项目：
* 基于Vue的前端(PC端)[mulanbay-ui-vue](https://gitee.com/mulanbay/mulanbay-ui-vue)
* 基于Jquery的前端(PC端)[mulanbay-ui-jquery](https://gitee.com/mulanbay/mulanbay-ui-jquery)
* 基于Jquery的前端(移动端)[mulanbay-mobile-jquery](https://gitee.com/mulanbay/mulanbay-mobile-jquery)

[木兰湾项目说明](https://gitee.com/mulanbay)

## 开发说明

### 所用技术

Vue、Element UI、Echarts

### 文档地址

木兰湾文档[https://www.yuque.com/mulanbay/rgvt6k/uy08n4](https://www.yuque.com/mulanbay/rgvt6k/uy08n4)

### 开发环境

```bash
# 克隆项目

# 进入项目目录
cd mulanbay-ui-vue

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm run dev
```

浏览器访问 http://localhost:9527

### 正式环境

```bash
# 构建测试环境
npm run build:stage
git clone https://gitee.com/mulanbay/mulanbay-ui-vue.git

# 构建生产环境
npm run build:prod
```
## 项目截图
<table>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/153409_2b13c53b_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/153455_ed3c4b64_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/153513_6448ba23_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/153529_a818b611_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/153547_c18e229c_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/153603_da9a31f2_352331.png"/></td>
    </tr>
</table>