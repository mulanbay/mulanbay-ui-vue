<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="周期" prop="period">
        <el-select
          v-model="queryParams.period"
          placeholder="周期"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in periodOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="queryParams.period == 'YEARLY'" label="选择年份">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          value-format="yyyy"
          style="width: 120px"
          placeholder="选择年份">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="queryParams.period == 'MONTHLY'" label="选择月份">
        <el-date-picker
          v-model="queryParams.yearMonth"
          type="month"
          value-format="yyyy-MM"
          style="width: 120px"
          placeholder="选择月份">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="消费类型" prop="consumeType">
        <el-select
          v-model="queryParams.consumeType"
          placeholder="方式"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in consumeTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据" prop="statType">
        <el-select
          v-model="queryParams.statType"
          placeholder="数据"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in statTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-s-data" size="mini" @click="handleQuery">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-s-data" size="mini" @click="handleReStat" v-hasPermi="['fund:budget:reStatTimeline']">重新统计</el-button>
      </el-form-item>
    </el-form>


    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getBudgetTimelineStat,reStatBudgetTimeline} from "@/api/fund/budget";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "BudgetTimelineStat",
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
      //账户状态
      consumeTypeOptions:[],
      //周期
      periodOptions:[
        {
          id: 'MONTHLY',
          text: '月度预算'
        },
        {
          id: 'YEARLY',
          text: '年度预算'
        }
      ],
      //数据类型
      statTypeOptions:[
        {
          id: 'RATE',
          text: '按比例'
        },
        {
          id: 'VALUE',
          text: '按金额'
        }
      ],
      // 查询参数
      queryParams: {
        period:'MONTHLY',
        yearMonth:(new Date()).Format("yyyy-MM"),
        statType:'RATE'
      }
    };
  },
  created() {
    this.getEnumTree('GoodsConsumeType','FIELD',false).then(response => {
      this.consumeTypeOptions = response;
    });
    this.initChart();
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
    /** 重新统计 */
    handleReStat(){
      const period = this.queryParams.period;
      const bussDay = this.getBussDay(period);
      let title = undefined;
      if(period=='MONTHLY'){
        title='是否重新统计'+this.queryParams.yearMonth+'月的所有预算及具体消费数据?';
      }else{
        title='是否重新统计'+this.queryParams.year+'年的所有预算及具体消费数据?';
      }
      this.$confirm(title, "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          const dd = {
            period:period,
            bussDay:bussDay
          }
          return reStatBudgetTimeline(dd);
        }).then(() => {
          this.msgSuccess("操作成功");
          this.initChart();
        }).catch(function() {
        }
      );
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.initChart();
    },
    /** 计算运营日 */
    getBussDay(period){
      if(period=='YEARLY'){
        return this.queryParams.year+'-01-01';
      }else{
        return this.queryParams.yearMonth+'-01';
      }
    },
    initChart() {
      this.openLoading();
      const period = this.queryParams.period;
      this.queryParams.bussDay = this.getBussDay(period);
      getBudgetTimelineStat(this.queryParams).then(
        response => {
          //组装chart数据
          response.chartType='LINE';
          if(period=='YEARLY'){
            response.itemLabelShow=false;
          }
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
