<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选取配置" prop="id">
       <treeselect
        v-model="queryParams.id"
        @input="handleQuery"
        style="width: 450px"
        :options="userNotifyOptions"
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
          <gauge-chart1 :chartData="warningChartData"/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <gauge-chart2 :chartData="alertChartData"/>
        </div>
      </el-col>
    </el-row>

    <div slot="footer" class="dialog-footer" align="center">
      <span style="color: red;">{{ statContent }}</span>
    </div>

  </div>
</template>

<script>
  import {getUserNotifyStat,getUserNotifyTree} from "@/api/report/notify/userNotify";
  import {deepClone} from "@/utils/index";
  import {getPercent} from "@/utils/mulanbay";

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import GaugeChart from '../../../chart/gauge'

export default {
  name: "Stat",
  components: {
    Treeselect,
    'gauge-chart1':GaugeChart,
    'gauge-chart2':GaugeChart
  },
  props: {
    userNotifyData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      warningChartData:{},
      alertChartData:{},
      // 查询参数
      queryParams: {
        id:undefined
      },
      userNotifyOptions:[],
      statContent:'',
      relatedBeans:undefined
    };
  },
  created() {
    this.handleReceiveData(this.userNotifyData);
  },
  watch: {
    userNotifyData: {
      deep: true,
      handler(val) {
        this.userNotifyData=val;
        this.handleReceiveData(this.userNotifyData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.relatedBeans = data.relatedBeans;
      this.getUserNotifyOptionsTreeselect();
      this.queryParams.id =data.id;
      this.handleQuery();
    },
    /** 查询搜索条件中的模板下拉树结构 */
    getUserNotifyOptionsTreeselect() {
      getUserNotifyTree(false,this.relatedBeans).then(response => {
        this.userNotifyOptions = response;
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
      getUserNotifyStat(this.queryParams).then(
        response => {
          if(response.userNotify.notifyConfig.resultType=='NAME_DATE'||response.userNotify.notifyConfig.resultType=='NAME_NUMBER'){
            this.statContent ='统计数据：'+response.name+'，  '+response.compareValue+response.userNotify.notifyConfig.valueTypeName;
          }else{
            this.statContent='';
          }
          let rateWarningPercent = getPercent(response.compareValue,response.userNotify.warningValue);
          let warningData={};
          warningData.value = rateWarningPercent;
          warningData.name = '达到比例';
          warningData.title='达到警告比例';
          warningData.subTitle='当前值:'+response.compareValue+",警告配置:"+response.userNotify.warningValue+',单位:'+response.userNotify.notifyConfig.valueTypeName;
          this.warningChartData = warningData;

          let rateAlertPercent = getPercent(response.compareValue,response.userNotify.alertValue);
          let alertData={};
          alertData.value = rateAlertPercent;
          alertData.name = '达到比例';
          alertData.title='达到报警比例';
          alertData.subTitle='当前值:'+response.compareValue+",报警配置:"+response.userNotify.alertValue+',单位:'+response.userNotify.notifyConfig.valueTypeName;
          this.alertChartData = alertData;
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
