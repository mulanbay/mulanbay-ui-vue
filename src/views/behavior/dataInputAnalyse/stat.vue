<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选取库表" prop="dataInputAnalyseId">
        <el-select
          v-model="queryParams.dataInputAnalyseId"
          placeholder="选取库表"
          collapse-tags
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in dataInputAnalyseOptions"
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
      <el-form-item  v-if="moreCdn==true" label="用户查询" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数据视图" prop="statType">
        <el-select
          v-model="queryParams.statType"
          placeholder="数据视图"
          collapse-tags
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
      <el-form-item label="延迟类型" prop="compareValue">
        <el-select
          v-model="queryParams.compareValue"
          placeholder="延迟类型"
          collapse-tags
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in compareValueOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['behavior:dataInputAnalyse:stat']">统计</el-button>
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
  import {getDataInputAnalyseTree,getDataInputAnalyseStat} from "@/api/behavior/dataInputAnalyse";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "Stat",
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
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //库表类型
      dataInputAnalyseOptions:[],
      compareValueOptions:[],
      //分组类型
      statTypeOptions:[
        {
          id: 'DAY',
          text: '时间'
        },
        {
          id: 'TABLE',
          text: '表'
        }
      ],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        statType:'DAY'
      }
    };
  },
  created() {
    this.getDataInputAnalyseTreeselect();
    //日期类型
    this.getDictItemTree('DATA_INPUT_ANALYSE_COMPARE_TYPE',false).then(response => {
      this.compareValueOptions = response;
    });
    this.initChart();
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
    /** 查询下拉树结构 */
    getDataInputAnalyseTreeselect() {
      getDataInputAnalyseTree(false).then(response => {
        this.dataInputAnalyseOptions = response;
      });
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
      getDataInputAnalyseStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
