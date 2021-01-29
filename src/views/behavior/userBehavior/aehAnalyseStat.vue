<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
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
      <el-form-item label="统计类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="统计类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据分组" prop="dataGroup">
        <el-select
          v-model="queryParams.dataGroup"
          placeholder="数据分组"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in dataGroupOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder="图表类型"
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
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['behavior:userBehavior:aehAnalyseStat']">统计</el-button>
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
  import {getAfterEightHourAnalyseStat} from "@/api/behavior/userBehavior";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "AehAnalyseStat",
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
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      typeOptions:[
        {
          id: 'MINUTES',
          text: '花费时间'
        },
        {
          id: 'COUNT',
          text: '次数'
        }
      ],
      dataGroupOptions:[
        {
          id: 'DETAIL',
          text: '明细'
        },
        {
          id: 'GROUP',
          text: '组'
        }
      ],
      chartTypeOptions:[
        {
          id: 'PIE',
          text: '饼图'
        },
        {
          id: 'MIX_LINE_BAR',
          text: '柱状图'
        }
      ],
      // 查询参数
      queryParams: {
        type:'MINUTES',
        dataGroup:'DETAIL',
        chartType:'PIE'
      }
    };
  },
  created() {
    this.initChart();
  },
  //监听父层带过来的账户信息值
  watch:{

  },
  methods: {
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
      getAfterEightHourAnalyseStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          response.chartType=this.queryParams.chartType;
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
