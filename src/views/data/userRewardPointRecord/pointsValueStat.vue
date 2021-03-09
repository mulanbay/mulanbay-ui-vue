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
      <el-form-item label="主键编号" prop="sourceId">
        <el-input
          v-model="queryParams.sourceId"
          placeholder="主键编号"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['data:userRewardPointRecord:pointsValueStat']">统计</el-button>
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
  import {getUserRewardPointRecordValueStat} from "@/api/data/userRewardPointRecord";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "UserRewardPointRecordPointsValueStat",
  components: {
    'common-chart':CommonChart
  },
  props: {
      //父层带过来的信息值
      userRewardPointRecordData: {
        sourceId:undefined,
        rewardSource:undefined
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
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      rewardSourceOptions:[],
      //统计分类
      dateGroupTypeOptions:[],
      // 查询参数
      queryParams: {
        rewardSource:'OPERATION',
        dateGroupType:'MONTH'
      }
    };
  },
  created() {
    this.getEnumTree('RewardSource', 'FIELD', false).then(response => {
      this.rewardSourceOptions = response;
    });
    this.getDictItemTree('CHART_DATE_GROUP',false).then(response => {
      this.dateGroupTypeOptions = response;
    });
    this.handleReceiveData(this.userRewardPointRecordData);
  },
  //监听父层带过来的账户信息值
  watch:{
    userRewardPointRecordData: {
      deep: true,
      handler(val) {
        this.userRewardPointRecordData =val;
        this.handleReceiveData(this.userRewardPointRecordData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.sourceId= data.sourceId;
      this.queryParams.rewardSource= data.rewardSource;
      this.initChart();
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
      getUserRewardPointRecordValueStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          const dateGroupType = this.queryParams.dateGroupType;
          if(dateGroupType==null||dateGroupType==""){
              response.chartType='PIE';
          }else if(dateGroupType=='DAYCALENDAR'){
            response.chartType='COMPARE_CALANDER';
          }else{
              response.chartType='LINE';
          }
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
