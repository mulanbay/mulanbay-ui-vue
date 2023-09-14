<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="检验项目" prop="name">
        <el-select
          v-model="queryParams.name"
          filterable
          allow-create
          default-first-option
          :style="{width: '200px'}"
          @change="handleQuery"
          >
          <el-option
            v-for="dict in nameOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="起止日期">
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-s-data" size="mini" @click="handleQuery">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <!--图表数据-->
    <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
    </div>

  </div>
</template>

<script>
  import {getTreatTestCategoryTree,getTreatTestStat} from "@/api/health/treat/treatTest";
  import * as echarts from 'echarts';
  import {chartProps,createChart} from "@/utils/echarts";
  import resize from '../../../dashboard/mixins/resize.js'

export default {
  name: "TreatTestStat",
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
    },
    //父层带过来的账户信息值
    statTreatTestData: {
      name: '',
    }
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      //项目
      nameOptions:[],
      // 查询参数
      queryParams: {
        name:undefined
      }
    };
  },
  created() {
    this.handleReceiveData(this.statTreatTestData);
  },
  //监听父层带过来的账户信息值
  watch:{
    statTreatTestData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      //需要重新查询账户树，否则显示不更新
      this.initOptionList();
      this.queryParams.name=data.name;
      this.initChart();
    },
    /** 初始化下拉树结构 */
    initOptionList(){
      getTreatTestCategoryTree(false).then(response => {
        this.nameOptions = response;
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
      getTreatTestStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          this.chartData = response.chartData;
          this.chartData.chartType=response.chartType;
          let option={};
          if(this.chartData.chartType=='LINE'){
            let minValue = response.minValue== null ? 0 : response.minValue;
            let maxValue = response.maxValue== null ? 0 : response.maxValue;
            option = this.createLineChartOption(this.chartData,minValue,maxValue);
          }else{
            option = this.createPieChartOption(this.chartData);
          }
          //组装chart数据
          if (this.chart == null) {
            this.chart = echarts.init(document.getElementById(this.id));
          }
          this.chart.resize();
          createChart(option, this.chart);
          this.loading.close();
        }
      );
    },
    createLineChartOption(data,minValue,maxValue) {
      const unit = data.unit == null ? '' : data.unit;
      //是否显示折线上的图标
      let showItemStyle = true;
      //显示最大最小值
      let showMarkPoint = true;
      //显示平均值
      let showMarkLine = true;
      //显示右上角的菜单
      let showToolbox = true;
      const ln = data.xdata.length;
      //根据x轴长度动态显示
      if(ln>20){
        showItemStyle = false;
      }
      let showLegend = data.showLegend == null ? true : data.showLegend;
      let smooth = data.smooth == null ? false : data.smooth;
      let markPoint = {};
      if (showMarkPoint == true) {
        markPoint = {
          data: [{
              type: 'max',
              name: '最大值'
            },
            {
              type: 'min',
              name: '最小值'
            }
          ],
          //位置偏移量
          //symbolOffset:[0, '-25px']
        };
      }
      let markLine = {};
      if (showMarkLine == true) {
        markLine = {
          data: [
            //{type: 'average',name: '平均值',lineStyle:{color: 'green',type:'solid'}},
            {name: '下限值',yAxis: minValue,lineStyle:{color: 'green',type:'solid'},label:{formatter:'{b}: {c}'}},
            {name: '上限值',yAxis: maxValue,lineStyle:{color: 'red',type:'solid'},label:{formatter:'{b}: {c}'}}
          ]
        };
      };
      let series = new Array();
      for (let i = 0; i < data.ydata.length; i++) {
        let serie = {
          name: data.ydata[i].name,
          type: 'line',
          smooth: smooth,
          dataView: {
            show: true,
            readOnly: false
          },
          label: {
            show: showItemStyle, //开启显示
            position: 'top', //在上方显示
            color: 'black',//数值样式
            fontSize: 16
          },
          data: data.ydata[i].data,
          markPoint: markPoint,
          markLine: markLine
        };
        series.push(serie);
      }
      let option = {
        title: {
          text: data.title,
          subtext: data.subTitle,
          x: 'center',
          y: 'top',
          textAlign: 'left',
          link: data.link
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            var relVal = params[0].name
            for (var i = 0, l = params.length; i < l; i++) {
              relVal += '<br/>' + params[i].seriesName +": &nbsp;&nbsp;&nbsp;"+ params[i].data +data.ydata[i].unit
            }
            return relVal
          },
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          show: showLegend,
          data: data.legendData,
          orient: 'horizontal',
          x: 'center',
          y: 'bottom',
          padding:[0,0,0,0]//可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
        },
        grid: { //四周的宽度
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true
        },
        toolbox: {
          show: showToolbox,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            dataView: {
              readOnly: false
            },
            magicType: {
              type: ['line', 'bar']
            },
            restore: {},
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.xdata
        },
        yAxis: {
          type: 'value',
          //min: 'dataMin',
          //max: 'dataMax',
          axisLabel: {
            formatter: '{value}' + unit
          }
        },
        series: series
      };
      return option;
    },
    createPieChartOption(data) {
      const unit = data.unit == null ? '' : data.unit;
      //显示项目
      let showLegend = data.showLegend == null ? true : data.showLegend;
      let series = new Array();
      for (let i = 0; i < data.detailData.length; i++) {
        let serie = {
          name: data.detailData[i].name,
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: data.detailData[i].data,
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            alignTo: 'labelLine', //labelLine
            formatter: '{name|{b}}\n{time|{c} ' + unit + ' ({d}%)}',
            minMargin: 5,
            edgeDistance: 10,
            lineHeight: 15,
            rich: {
              time: {
                fontSize: 12,
                color: '#460000'
              }
            }
          }
        };
        series.push(serie);
      };
      let option = {
        title: {
          text: data.title,
          subtext: data.subTitle,
          x: 'center'
        },
        toolbox: {
          show: false,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            dataView: {
              show: true,
              readOnly: false
            },
            magicType: {
              type: ['line', 'bar']
            },
            restore: {},
            saveAsImage: {}
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} " + unit + "({d}%)"
        },
        legend: {
          show: showLegend,
          orient: 'vertical',
          left: 'left',
          data: data.xdata
        },
        series: series
      };
      return option;
    }
  }
};
</script>
