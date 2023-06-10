<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="看病日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="疾病标签" prop="tags">
        <el-select
          v-model="queryParams.tags"
          placeholder="疾病标签"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in hisTagOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="全链接" prop="unionAll">
        <el-switch v-model="queryParams.unionAll" @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery"
          v-hasPermi="['health:treat:treatRecord:relation']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
  </div>

  </div>
</template>

<script>
  import {getTreatRecordRelation,getTreatRecordTagsTree} from "@/api/health/treat/treatRecord";
  import * as echarts from 'echarts';
  import {chartProps,createChart} from "@/utils/echarts";
  import resize from '../../../dashboard/mixins/resize.js'
  import {copyObject,getQueryObject} from "@/utils/index";

  export default {
    name: "TreatRecordRelation",
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
        //日期范围快速选择
        datePickerOptions:this.datePickerOptions,
        // 日期范围
        dateRange: [],
        //历史标签（查询或者选择使用）
        hisTagOptions:[],
        // 查询参数
        queryParams: {
          tags:undefined,
          unionAll:false
        }
      };
    },
    created() {
      this.getTreatRecordTagsTreeselect();
      let qb = getQueryObject(null);
      if(qb.tags!=null){
        this.queryParams.tags = qb.tags;
        this.handleQuery();
      }

    },
    methods: {
      /** 查询标签下拉树结构 */
      getTreatRecordTagsTreeselect() {
        getTreatRecordTagsTree(false).then(response => {
          this.hisTagOptions = response;
        });
      },
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
        getTreatRecordRelation(this.addDateRange(this.queryParams, this.dateRange)).then(
          response => {
            //组装chart数据
            if (this.chart == null) {
              this.chart = echarts.init(document.getElementById(this.id));
            }
            //this.chart.resize();
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
