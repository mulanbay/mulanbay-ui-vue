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
      <el-form-item label="统计分类" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分类"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计字段" prop="feeField">
        <el-select
          v-model="queryParams.feeField"
          placeholder="统计字段"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in feeFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="名称查询" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="跟踪疾病" prop="disease">
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
      <el-form-item v-if="moreCdn==true" label="看病类型" prop="treatType">
        <el-select
          v-model="queryParams.treatType"
          placeholder=""
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in treatTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder=""
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in chartTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="补全日期" prop="compliteDate">
        <el-switch v-model="queryParams.compliteDate" ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatRecord:dateStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getTreatCategoryTree,getTreatRecordDateStat} from "@/api/health/treat/treatRecord";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "TreatRecordDateStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //加载层配置
      loadingOptions: this.loadingOptions,
      //图表数据
      chartData:{},
      //运动类型
      feeFieldOptions:[],
      //统计分类
      dateGroupTypeOptions:[],
      chartTypeOptions:[],
      diseaseOptions:[],
      treatTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        dateGroupType:'MONTH',
        compliteDate:true,
        feeField:'total_fee',
        chartType:'MIX_LINE_BAR'
      }
    };
  },
  created() {
    this.getDictItemTree('CHART_DATE_GROUP',false).then(response => {
      this.dateGroupTypeOptions = response;
    });
    this.getDictItemTree('TREAT_DATE_STAT_FIELD',false).then(response => {
      this.feeFieldOptions = response;
    });
    this.getEnumTree('TreatType','ORDINAL',false).then(response => {
      this.treatTypeOptions = response;
    });
    this.getDictItemTree('DATE_STAT_CHART_TYPE',false).then(response => {
      this.chartTypeOptions = response;
    });
    this.initChart();
    getTreatCategoryTree('disease',false).then(response => {
      this.diseaseOptions = response;
    });
  },
  methods: {
    /** 更多查询条件处理 */
    handleMoreCdn(){
      if(this.moreCdn==true){
        //this.resetForm("queryForm");
        this.moreCdn=false;
        this.cdnTitle='更多';
      }else{
        this.moreCdn=true;
        this.cdnTitle='取消';
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
      getTreatRecordDateStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          const dateGroupType = this.queryParams.dateGroupType;
          const chartType = this.queryParams.chartType;
          switch (this.queryParams.dateGroupType) {
            case 'DAYCALENDAR':
              //日历图
              response.chartType = 'CALANDER';
              break;
            case 'HOURMINUTE':
              //散点图
              response.chartType = 'SCATTER';
              break;
            default:
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
