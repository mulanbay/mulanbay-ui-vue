<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="统计类型" prop="dateGroupType">
        <el-radio-group v-model="queryParams.dateGroupType" @change="getUserPlanOptionsTreeselect">
          <el-radio label="YEAR">年</el-radio>
          <el-radio label="MONTH">月</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="选取计划" prop="userPlanId">
       <treeselect
        v-model="queryParams.userPlanId"
        style="width: 240px"
        :options="userPlanOptions"
        :disable-branch-nodes="true"
        :show-count="true"
        :searchable="true"
        placeholder="请选择"
        />
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'YEAR'" label="选择年份">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          value-format="yyyy"
          placeholder="选择年份">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'MONTH'" label="选择月份">
        <el-date-picker
          v-model="queryParams.yearMonth"
          type="month"
          value-format="yyyy-MM"
          placeholder="选择月份">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['report:plan:planReport:timelineStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-s-data" size="mini" @click="handleReStat" v-hasPermi="['report:plan:planReport:reStatTimeline']">重新统计</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getUserPlanTree} from "@/api/report/plan/userPlan";
  import {getPlanReportTimelineStat,reStatPlanReportTimeline} from "@/api/report/plan/planReport";
  import {getQueryObject} from "@/utils/index";

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "PlanReportTimelineStat",
  components: {
    Treeselect,
    'common-chart':CommonChart
  },
  props: {
    //父层带过来的账户信息值
    userPlanData: {
      userPlanId: '',
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
      userPlanOptions:[],
      // 查询参数
      queryParams: {
        dateGroupType:'MONTH',
        year:undefined,
        yearMonth:undefined,
        userPlanId:undefined
      }
    };
  },
  created() {
    this.handleReceiveData(this.userPlanData);
  },
  //监听父层带过来信息值
  watch:{
    userPlanData: {
      deep: true,
      handler(val) {
        this.userPlanData =val;
        this.handleReceiveData(this.userPlanData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      if(data==null||data.userPlanId==null){
        this.getUserPlanOptionsTreeselect();
      }else{
        this.queryParams.userPlanId = data.userPlanId;
        this.queryParams.dateGroupType = data.dateGroupType;
        if(this.queryParams.dateGroupType == 'YEAR'){
          this.queryParams.year= data.bussStatDate.substring(0,4);
        }else{
          this.queryParams.yearMonth= data.bussStatDate.substring(0,7);
        }
        this.getUserPlanOptionsTreeselect();
        this.initChart();
      }
    },
    /** 查询搜索条件中的模板下拉树结构 */
    getUserPlanOptionsTreeselect() {
      getUserPlanTree(false,this.queryParams.dateGroupType).then(response => {
        this.userPlanOptions = response;
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
    /** 计算运营日 */
    getBussDay(dateGroupType){
      if(dateGroupType=='YEAR'){
        return this.queryParams.year+'-01-01';
      }else{
        return this.queryParams.yearMonth+'-01';
      }
    },
    /** 重新统计 */
    handleReStat(){
      const dateGroupType = this.queryParams.dateGroupType;
      const userPlanId = this.queryParams.userPlanId;
      const bussDay = this.getBussDay(dateGroupType);
      let title = undefined;
      if(dateGroupType=='MONTH'){
        title='是否重新统计'+this.queryParams.yearMonth+'月的时间线统计数据?';
      }else{
        title='是否重新统计'+this.queryParams.year+'年的时间线统计数据?';
      }
      this.$confirm(title, "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          const dd = {
            dateGroupType:dateGroupType,
            userPlanId:userPlanId,
            bussDay:bussDay
          }
          return reStatPlanReportTimeline(dd);
        }).then(() => {
          this.msgSuccess("操作成功");
          this.initChart();
        }).catch(function() {
        }
      );
    },
    initChart() {
      const dateGroupType = this.queryParams.dateGroupType;
      if(dateGroupType=='MONTH'){
        let v = this.queryParams.yearMonth;
        if(this.isObjectEmpty(v)){
          this.msgError('请选择时间');
          return;
        }
        this.queryParams.year = v.substring(0,4);
        this.queryParams.month = v.substring(5,7);
      }else{
        if(this.isObjectEmpty(this.queryParams.year)){
          this.msgError('请选择时间');
          return;
        }
        this.queryParams.month = '0';
      }
      this.openLoading();
      getPlanReportTimelineStat(this.queryParams).then(
        response => {
          //组装chart数据
          response.chartType='LINE';
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
