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
      <el-form-item label="积分来源" prop="rewardSource">
        <el-select
          v-model="queryParams.rewardSource"
          placeholder="积分来源"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in rewardSourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序方式" prop="orderBy">
        <el-select
          v-model="queryParams.orderBy"
          placeholder="排序"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in orderByOptions"
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
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['data:userRewardPointRecord:pointsSourceStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleFullQuery" v-hasPermi="['data:userRewardPointRecord:fullStat']">旭日图</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getUserRewardPointRecordSourceStat} from "@/api/data/userRewardPointRecord";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "PointsSourceStat",
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
      rewardSourceOptions:[],
      orderByOptions:[
        {
          id: 'VALUE',
          text: '积分'
        },
        {
          id: 'COUNTS',
          text: '次数'
        }
      ],
      chartTypeOptions:[
        {
          id: 'PIE',
          text: '饼图'
        },
        {
          id: 'BAR',
          text: '柱状图'
        }
      ],
      // 查询参数
      queryParams: {
        rewardSource:'OPERATION',
        orderBy:'VALUE',
        chartType:'BAR'
      }
    };
  },
  created() {
    this.getEnumTree('RewardSource', 'FIELD', false).then(response => {
      this.rewardSourceOptions = response;
    });
    this.initChart();
  },
  //监听父层带过来的账户信息值
  watch:{

  },
  methods: {
    /** 旭日图操作 */
    handleFullQuery(){
      //路由定向
      this.$router.push({name:'UserRewardPointRecord/fullStat',query: {}})
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
    initChart() {
      this.openLoading();
      getUserRewardPointRecordSourceStat(this.addDateRange(this.queryParams, this.dateRange)).then(
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
