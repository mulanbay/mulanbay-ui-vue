<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="图表选择" prop="userChartId">
        <treeselect
         v-model="queryParams.userChartId"
         @select="selectChart"
         style="width: 450px"
         :options="userChartOptions"
         :disable-branch-nodes="true"
         :show-count="true"
         :searchable="true"
         placeholder="请选择图表"
         />
      </el-form-item>
      <el-form-item label="起止日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          :disabled="datePickerDisable"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['report:chart:userChart:stat']">统计</el-button>
        <el-button type="primary" icon="el-icon-d-arrow-left" size="mini" @click="getNext(-1)" v-hasPermi="['report:chart:userChart:stat']">上一个</el-button>
        <el-button type="primary" icon="el-icon-d-arrow-right" size="mini" @click="getNext(1)" v-hasPermi="['report:chart:userChart:stat']">下一个</el-button>
        <el-button type="primary" icon="el-icon-link" size="mini" @click="handleDetail" >详情</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getUserChartTree,getChartPara,statChart} from "@/api/report/chart/userChart";
  import CommonChart from '../../../chart/commonChart'
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "UserChartStat",
  components: {
    Treeselect,
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //详情页面跳转的URL
      detailUrl:'',
      datePickerDisable:false,
      //快捷方式
      treeIds:[],
      currentIndex:0,
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //图表列表
      userChartOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {

      }
    };
  },
  created() {
    //查询账户树
    this.getUserChartTreeselect();
  },
  methods: {
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    /** 查询搜索条件中的账户下拉树结构 */
    getUserChartTreeselect() {
      getUserChartTree(false,null).then(response => {
        this.userChartOptions = response.treeData;
        this.treeIds = response.treeIds;
        this.currentIndex=0;
      });
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
    /** 跳转到具体的业务页面 */
    handleDetail(){
      if(this.isObjectEmpty(this.detailUrl)){
        this.msgError('该图表没有详情连接地址');
        return;
      }
      this.$router.push({name:this.detailUrl,query: {}})
    },
    /** 选择图表操作 */
    selectChart(node){
      this.queryParams.userChartId = node.id;
      this.setCurrentIndex(this.queryParams.userChartId);
      this.initChart();
    },
    /** 设置快捷索引 */
    setCurrentIndex(id) {
      for(let i=0;i<this.treeIds.length;i++){
        if(id==this.treeIds[i]){
          this.currentIndex=i;
        }
      }
    },
    //下一个\上一个快速选择
    getNext(v) {
      this.currentIndex = this.currentIndex+v;
      if(this.currentIndex>=this.treeIds.length){
        this.currentIndex=0;
      }
      if(this.currentIndex<0){
        this.currentIndex=this.treeIds.length-1;
      }
      let id = this.treeIds[this.currentIndex];
      this.queryParams.userChartId= id;
      this.initChart();
    },
    initChart() {
      this.openLoading();
      getChartPara(this.queryParams.userChartId).then(
        response => {
          let supportDate = response.supportDate;
          this.detailUrl = response.detailUrl;
          let para = eval('(' + response.para + ')');
          const url = response.url;
          if(supportDate==true){
            this.datePickerDisable=false;
            para = this.addDateRange(para, this.dateRange);
          }else{
            this.datePickerDisable=true;
          }
          this.handleStatChart(url,para,response.chartType);
        }
      );
    },
    handleStatChart(url,para,chartType){
      statChart(url,para).then(
        response => {
          //组装chart数据
          response.chartType=chartType;
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
