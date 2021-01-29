<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称查询" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
      <el-form-item label="统计分类" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分类"
          clearable
          size="small"
          style="width: 240px"
          @change="loadDiseaseOptions"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder=""
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in chartTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="跟踪疾病" prop="disease">
        <el-select
          v-model="queryParams.disease"
          placeholder=""
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in diseaseOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="补全日期" prop="compliteDate">
        <el-switch v-model="queryParams.compliteDate" ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['health:body:bodyAbnormalRecord:dateStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getAbnormalCategoryTree,getBodyAbnormalRecordDateStat} from "@/api/health/body/bodyAbnormalRecord";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "DateStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //图表数据
      chartData:{},
      //统计分类
      dateGroupTypeOptions:[],
      diseaseOptions:[],
      chartTypeOptions:[],
      //加载层配置
      loadingOptions: this.loadingOptions,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        dateGroupType:'MONTH',
        compliteDate:true,
        chartType:'MIX_LINE_BAR'
      }
    };
  },
  created() {
    this.getDictItemTree('CHART_DATE_GROUP',false).then(response => {
      this.dateGroupTypeOptions = response;
    });
    this.getDictItemTree('DATE_STAT_CHART_TYPE',false).then(response => {
      this.chartTypeOptions = response;
    });
    this.initChart();
  },
  methods: {
    loadDiseaseOptions(){
      const dateGroupType = this.queryParams.dateGroupType;
      if(dateGroupType=='DAYCALENDAR'){
        getAbnormalCategoryTree('disease',false).then(response => {
          this.diseaseOptions = response;
        });
      }
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
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    initChart() {
      this.openLoading();
      getBodyAbnormalRecordDateStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          const dateGroupType = this.queryParams.dateGroupType;
          const chartType = this.queryParams.chartType;
          if(dateGroupType=='DAYCALENDAR'){
            response.chartType = 'CALANDER';
          }else{
            response.chartType=chartType;
          }
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
