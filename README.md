## 项目介绍
木兰湾是用于管理个人消费、锻炼、音乐、阅读、健康、饮食、人生经历等各个衣食住行信息的系统，通过提醒、计划模块利用调度系统来统计分析执行情况。
并通过积分和评分体系来综合评估个人的总体状态。

 **基于SpringBoot3和Vue3新版的项目地址：** 

后端项目：
* 服务器端[mulanbay-server3](https://gitee.com/mulanbay/mulanbay-server3),发行版:[releases](https://gitee.com/mulanbay/mulanbay-server3/releases)

前端项目：
* PC端[mulanbay-ui-vue3](https://gitee.com/mulanbay/mulanbay-ui-vue3),发行版:[releases](https://gitee.com/mulanbay/mulanbay-ui-vue3/releases)

 **该项目基于SpringBoot2和Vue2** 

该系统是前后端分离的项目，当前项目mulanbay-ui-vue为前端PC版本，需要结合后端项目才能完整访问。

木兰湾后端项目：
* 服务器端[mulanbay-server](https://gitee.com/mulanbay/mulanbay-server)

木兰湾前端项目：

VUE版本
* 基于Vue的前端(PC端)[mulanbay-ui-vue](https://gitee.com/mulanbay/mulanbay-ui-vue)
* 基于Vue的前端(移动端)[mulanbay-mobile-vue](https://gitee.com/mulanbay/mulanbay-mobile-vue)

Jquery版本(V3.0版本后不再维护，以VUE版本为主)
* 基于Jquery的前端(PC端)[mulanbay-ui-jquery](https://gitee.com/mulanbay/mulanbay-ui-jquery)
* 基于Jquery的前端(移动端)[mulanbay-mobile-jquery](https://gitee.com/mulanbay/mulanbay-mobile-jquery)

[木兰湾项目说明](https://gitee.com/mulanbay)

## 开发说明

### 所用技术

Vue、Element UI、Echarts

### 软件要求
| 软件                    | 版本          |
| ---------------------- | ------------- |
| Node                   | v10.19.0      |
| Nginx                  | 1.17+         |

### 文档地址

木兰湾文档[https://www.yuque.com/mulanbay/rgvt6k/uy08n4](https://www.yuque.com/mulanbay/rgvt6k/uy08n4)

### 开发环境

```bash
# 克隆项目

# 进入项目目录
cd mulanbay-ui-vue

# 配置api地址
在vue.config.js中配置api服务器的地址（已配置好后端默认地址localhost:8080/api）

# 安装依赖
npm install

# 如果安装比较慢，可以选择以下指定源。
# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

#
# 启动服务
npm run dev
```

浏览器访问 http://localhost:9527
（前后端可以联动访问，开发模式运行主要是修改代码后直接热部署看到实时修改的效果）

### 正式环境

```bash
# 构建测试环境
git clone https://gitee.com/mulanbay/mulanbay-ui-vue.git

# 构建生产环境
npm run build:prod

# 配置nginx
构建成功后会在工程的dist输出打包好的文件，然后需要再在nginx配置代理，配置方法参加上面的木兰湾文档。

```

## 运行说明
由于木兰湾是前后端分离项目，通常以nginx作为代理配置，方法参见文档

```

    server {

        listen       80;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;
        
        # 头像地址
        location /20 {
            root   /mulanbay/server/mulanbayServer/avatar;
            try_files $uri $uri/ /index.html;
            index  index.html index.htm;
            charset   utf-8;
        }
        
        # 后端api地址
        location /api {
            root   html;
            index  index.html index.htm;
            proxy_pass http://127.0.0.1:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        # Vue的PC端地址(默认)
        location / {
            root /mulanbay/server/mulanbayServer/ui/vue;
            charset   utf-8;
            try_files $uri $uri/ /index.html;
            index  index.html index.htm;            
        }
    }

```

## 项目截图

### 基于Vue的PC端
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
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2020/1215/175924_d4f8a9ac_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2020/1215/175948_a77fa716_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163144_7da250d2_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163209_772602c4_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163237_935cfb98_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163258_4e3143a0_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163342_5eae1415_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163359_69c7a4db_352331.png"/></td>
    </tr>
</table>

### 基于Vue的移动端
<table>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2021/0225/134154_6c5f78ad_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2021/0225/134216_58f63cf3_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2021/0225/134236_7c81bf14_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163914_91f69093_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2021/0225/134321_56b72e90_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2021/0225/134338_e1766f98_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163524_9286315d_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163541_d2c998a4_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163618_3737b37e_352331.png"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2021/0324/163637_7f904b6c_352331.png"/></td>
    </tr>
</table>

### 微信公众号消息推送

<table>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/154050_af85354a_352331.jpeg "Screenshot_20201015_150843_com.tencent.mm.jpg"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/154104_31b29a07_352331.jpeg "Screenshot_20201015_150911_com.tencent.mm.jpg"/></td>
    </tr>

</table>

### 鸣谢
谢谢JetBrains公司一直以来对木兰湾项目的支持，提供了全系列产品的免费license。

<img src="https://foruda.gitee.com/images/1712229322943756523/d28d99c2_352331.png" width="100px" height="100px">

JetBrains开源支持计划：https://jb.gg/OpenSourceSupport.
