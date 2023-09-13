<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable size="small" style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery"
          v-hasPermi="['system:qaConfig:stat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
    </div>

  </div>
</template>

<script>
  import {getQaConfigStat} from "@/api/system/qaConfig";
  import * as echarts from 'echarts';
  import {chartProps,createChart} from "@/utils/echarts";
  import resize from '../../dashboard/mixins/resize.js'

  export default {
    name: "QaConfigStat",
    mixins: [resize],
    mixins: [resize],
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      id: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: (document.body.clientHeight - 180).toString() + 'px'
      },
      autoResize: {
        type: Boolean,
        default: true
      }
    },
    mounted() {
      //this.initChart();
    },
    data() {
      return {
        // 加载层信息
        loading: [],
        //加载层配置
        loadingOptions: this.loadingOptions,
        // 查询参数
        queryParams: {}
      };
    },
    created() {
      this.initChart();
    },
    methods: {
      // 打开加载层
      openLoading() {
        this.loading = this.$loading(this.loadingOptions);
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.initChart();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
        this.initChart();
      },
      initChart() {
        this.openLoading();
        getQaConfigStat(this.queryParams).then(
          response => {
            //组装chart数据
            if (this.chart == null) {
              this.chart = echarts.init(document.getElementById(this.id));
            }
            this.chart.resize();
            let option = this.createChartOption(response);
            createChart(option, this.chart);
            this.loading.close();
          }
        );
      },
      /**
       * 关系图
       * 参考：https://www.makeapie.com/editor.html?c=xkiiaUN8q
       * @param {Object} resData
       */
      createChartOption(resData) {
        let data = {
          nodes: resData.itemDataList,
          links: resData.linkDataList
        }
        const colorList=['#006acc','#ff7d18', '#bda29a', '#61a0a8','#10a050', '#8B0A50','#080808', '#546570'];
        let categories = new Array();
        let cn = resData.categoryNames.length;
        for (let i = 0; i < cn; i++) {
          let cg = {
            name: resData.categoryNames[i],
            itemStyle: {
              color: colorList[i]
            }
          };
          categories.push(cg);
        }
        data.nodes.forEach(node => {
          //最大支持8级
          let index = node.category%8;
          node.symbolSize = 80-10*index;
          node.itemStyle = {
            color: colorList[index]
          };
        });

        data.links.forEach(link => {
          let index = link.type%8;
          link.label = {
            align: 'center',
            fontSize: 12,
            color:colorList[index]
          };
          link.lineStyle = {
            color: colorList[index]
          }
        });

        let option = {
          title: {
            text: resData.title,
          },
          tooltip: {},
          legend: [{
            // selectedMode: 'single',
            data: categories.map(x => x.name),
            // icon: 'circle'
          }],
          animationDuration: 1500,
          animationEasingUpdate: 'quinticInOut',
          series: [{
            type: 'graph',
            layout: 'force',
            symbolSize: 58,
            draggable: false,// 是否可拖动
            roam: true,
            categories: categories,
            scaleLimit: {
              //所属组件的z分层，z值小的图形会被z值大的图形覆盖
              min: 0.5, //最小的缩放值
              max: 9 //最大的缩放值
            },
            edgeSymbol: ['', 'arrow'],
            //edgeSymbolSize: [80, 10],
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: 10
              }
            },
            lineStyle: {
              color: 'source',
              curveness: 0 // 连接线的弧度，值：0-1之间
            },
            edgeLabel: {
              show: true,
              fontSize: 20,
              formatter(x) {
                return x.data.name;
              }
            },
            label: {
              show: true
            },
            force: {
              repulsion: 2000,
              edgeLength: 120
            },
            data: data.nodes,
            links: data.links
          }]
        };
        return option;
      }
    }
  };
</script>
