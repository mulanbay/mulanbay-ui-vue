<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart :chartData="hospitalChartData"/>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart :chartData="departmentChartData"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart :chartData="organChartData"/>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart :chartData="osNameChartData"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>

</template>

<script>
  import {getTreatRecordAnalyseStat} from "@/api/health/treat/treatRecord";
  import PieChart from '../../../chart/pieChart'

export default {
  name: "TreatRecordFullStatAnalyse",
  components: {
    'pie-chart':PieChart
  },
  props: {
    //父层带过来的信息值
    treatRecordData: {}
  },
  data() {
    return {
      //以医院维度分析
      hospitalChartData: {},
      //以科室维度分析
      departmentChartData: {},
      //以器官维度分析
      organChartData: {},
      //以门诊类型维度分析
      osNameChartData: {},
      // 统计数据
      statData:{},
      loading :false
    };
  },
  created() {
    this.handleReceiveData(this.treatRecordData);
  },
  mounted() {
     this.handleReceiveData(this.treatRecordData);
  },
  //监听父层带过来的账户信息值
  watch:{
    treatRecordData: {
      deep: true,
      handler(val) {
        this.treatRecordData =val;
        this.handleReceiveData(this.treatRecordData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      let tags = data.tags;
      this.initHospitalChart(tags);
      this.initDepartmentChart(tags);
      this.initOrganChart(tags);
      this.initOsNameChart(tags);
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
    /** 医院分析 */
    initHospitalChart(tags) {
      let paras= {
        tags: tags,
        groupField:'hospital',
        groupType:'COUNT',
        feeField:'total_fee',
        chartType:'PIE',
      };
      getTreatRecordAnalyseStat(paras).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          response.title ='医院分析';
          this.hospitalChartData = response;
          //重新设定高度
          this.hospitalChartData.height = '300px';
        }
      );
    },
    /** 科室分析 */
    initDepartmentChart(tags) {
      let paras= {
        tags: tags,
        groupField:'department',
        groupType:'COUNT',
        feeField:'total_fee',
        chartType:'PIE',
      };
      getTreatRecordAnalyseStat(paras).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          response.title ='科室分析';
          this.departmentChartData = response;
          //重新设定高度
          this.departmentChartData.height = '300px';
        }
      );
    },
    /** 器官分析 */
    initOrganChart(tags) {
      let paras= {
        tags: tags,
        groupField:'organ',
        groupType:'COUNT',
        feeField:'total_fee',
        chartType:'PIE',
      };
      getTreatRecordAnalyseStat(paras).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          response.title ='器官分析';
          this.organChartData = response;
          //重新设定高度
          this.organChartData.height = '300px';
        }
      );
    },
    /** 器官分析 */
    initOsNameChart(tags) {
      let paras= {
        tags: tags,
        groupField:'os_name',
        groupType:'COUNT',
        feeField:'total_fee',
        chartType:'PIE',
      };
      getTreatRecordAnalyseStat(paras).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          response.title ='门诊分析';
          this.osNameChartData = response;
          //重新设定高度
          this.osNameChartData.height = '300px';
        }
      );
    }
  }
};
</script>
