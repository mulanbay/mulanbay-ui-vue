<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所在公司" prop="companyId">
        <el-select
          v-model="queryParams.companyId"
          placeholder="公司"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in companyOptions"
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
      <el-form-item label="补全日期" prop="compliteDate">
        <el-switch v-model="queryParams.compliteDate" ></el-switch>
      </el-form-item>
      <el-form-item label="图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder="图表类型"
          size="small"
          style="width: 115px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in chartTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['work:workOvertime:dateStat']">统计</el-button>
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
  import {getWorkOvertimeDateStat} from "@/api/work/workOvertime";
  import {getCompanyTree} from "@/api/work/company";
  import {deepClone} from "@/utils/index";
  import CommonChart from '../../chart/commonChart'

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
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //图表数据
      chartData:{},
      //统计分类
      dateGroupTypeOptions:[],
      companyOptions:[],
      //图表类型
      chartTypeOptions:[],
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
    this.getCompanyTreeselect();
    this.getDictItemTree('DATE_STAT_CHART_TYPE',false).then(response => {
      this.chartTypeOptions = response;
    });
    this.initChart();
  },
  methods: {
    /** 查询公司下拉树结构 */
    getCompanyTreeselect() {
      getCompanyTree(false).then(response => {
        this.companyOptions = response;
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
    initChart() {
      const dateGroupType = this.queryParams.dateGroupType;
      if(dateGroupType=='DAYCALENDAR'){
        this.msgError('目前不支持该分组模式');
        return;
      }
      this.loading = this.$loading(this.loadingOptions);
      getWorkOvertimeDateStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
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
