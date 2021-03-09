<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选取计划" prop="id">
       <treeselect
        v-model="queryParams.id"
        @input="handleQuery"
        style="width: 450px"
        :options="userPlanOptions"
        :disable-branch-nodes="true"
        :show-count="true"
        :searchable="true"
        placeholder="请选择"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['report:notify:userNotify:stat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <gauge-chart1 :chartData="countChartData"/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <gauge-chart2 :chartData="valueChartData"/>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  import {getUserPlanStat,getUserPlanTree} from "@/api/report/plan/userPlan";
  import {deepClone} from "@/utils/index";
  import {getPercent} from "@/utils/mulanbay";

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import GaugeChart from '../../../chart/gauge'

export default {
  name: "UserPlanStat",
  components: {
    Treeselect,
    'gauge-chart1':GaugeChart,
    'gauge-chart2':GaugeChart
  },
  props: {
    userPlanData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      countChartData:{},
      valueChartData:{},
      // 查询参数
      queryParams: {
        id:undefined
      },
      relatedBeans:undefined,
      userPlanOptions:[],
      statContent:''
    };
  },
  created() {
    //this.getUserPlanOptionsTreeselect();
    this.handleReceiveData(this.userPlanData);
  },
  watch: {
    userPlanData: {
      deep: true,
      handler(val) {
        this.userPlanData=val;
        this.handleReceiveData(this.userPlanData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.id =data.id;
      this.relatedBeans = data.relatedBeans;
      this.getUserPlanOptionsTreeselect();
      this.handleQuery();
    },
    /** 查询搜索条件中的模板下拉树结构 */
    getUserPlanOptionsTreeselect() {
      getUserPlanTree(false,null,this.relatedBeans).then(response => {
        this.userPlanOptions = response;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      const id = this.queryParams.id;
      //console.log('id:'+id);
      if(this.isObjectEmpty(id)){
        return;
      }
      this.initChart();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.initChart();
    },
    initChart() {
      getUserPlanStat(this.queryParams).then(
        response => {
          let rateCountPercent = getPercent(response.reportCountValue,response.planCountValue);
          let countData={};
          countData.value = rateCountPercent;
          countData.name = '达到比例';
          countData.title='次数完成比例';
          countData.subTitle='完成次数值:'+response.reportCountValue+",计划次数:"+response.planCountValue;
          this.countChartData = countData;

          let rateValuePercent = getPercent(response.reportValue,response.planValue);
          let valueData={};
          valueData.value = rateValuePercent;
          valueData.name = '达到比例';
          valueData.title='值完成比例';
          valueData.subTitle= '完成值:'+response.reportValue+",计划值:"+response.planValue+',单位:'+response.userPlan.unit;
          this.valueChartData = valueData;
        }
      );
    }
  }
};
</script>
<style lang="scss" scoped>
@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
