<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="ID">
          <el-input-number v-model="queryParams.id" clearable :min="0" label="" style="width: 200px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['data:userScore:analyse']">统计</el-button>
        <el-button type="query" icon="el-icon-d-arrow-left" size="mini" @click="handleFetch('EARLY')" v-hasPermi="['data:userScore:getNextId']">往前</el-button>
        <el-button type="query" icon="el-icon-d-arrow-right" size="mini" @click="handleFetch('LATER')" v-hasPermi="['data:userScore:getNextId']">往后</el-button>
      </el-form-item>
    </el-form>

  <!--图表数据-->
  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
  </div>

  </div>
</template>

<script>
  import {getUserScoreAnalyse,getUserScoreNextId} from "@/api/data/userScore";
  import {chartProps,createRadarChart} from "@/utils/echarts";
  import * as echarts from 'echarts';
  import resize from '../../dashboard/mixins/resize.js'
export default {
  name: "UserScoreAnalyse",
  mixins: [resize],
  props: {
    //父层带过来的账户信息值
    userScoreData: {
      id: '',
    },
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
      default: (document.body.clientHeight - 400).toString() + 'px'
    },
  },
  mounted() {
     //this.initChart();
  },
  beforeDestroy() {
    if (!this.chart) {
        return
    }
    this.chart.dispose()
    this.chart = null;
  },
  data() {
    return {
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      // 查询参数
      queryParams: {
        id:undefined
      }
    };
  },
  created() {
    this.handleReceiveData(this.userScoreData);
  },
  //监听父层带过来的账户信息值
  watch:{
    userScoreData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.id=data.id;
      this.initChart();
    },
    /** 往前/往后按钮操作 */
    handleFetch(compareType){
      let para ={
        currentId:this.queryParams.id,
        compareType:compareType
      };
      //获取下一个id
      getUserScoreNextId(para).then(
        response => {
          if(response==null){
            this.msgError('没有更多数据');
          }else{
            this.queryParams.id = response;
            this.initChart();
          }
        }
      );
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
      getUserScoreAnalyse(this.queryParams).then(
        response => {
          //组装chart数据
          if(this.chart==null){
            this.chart = echarts.init(document.getElementById(this.id));
          }
          createRadarChart(response,this.chart);
          this.loading.close();
        }
      );
    }
  }
};
</script>
