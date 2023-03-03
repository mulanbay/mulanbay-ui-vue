<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="起止日期">
        <el-select
          v-model="queryParams.dateQueryType"
          placeholder="日期类型"
          collapse-tags
          size="small"
          style="width: 140px"
        >
          <el-option
            v-for="dict in dateQueryTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
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
      <el-form-item label="分组类型" prop="groupType">
        <el-select
          v-model="queryParams.groupType"
          placeholder="分组类型"
          collapse-tags
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
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
          collapse-tags
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
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['dream:stat']">统计</el-button>
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
  import {getDreamStatList} from "@/api/dream/dream";
  import CommonChart from '../chart/commonChart'

export default {
  name: "DreamStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     this.initChart();
  },
  data() {
    return {
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //时间类型
      dateQueryTypeOptions:[],
      //分组类型
      groupTypeOptions:[
        {
          id: 'STATUS',
          text: '状态'
        },
        {
          id: 'DIFFICULTY',
          text: '困难程度'
        },
        {
          id: 'IMPORTANTLEVEL',
          text: '重要程度'
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
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        groupType:'STATUS',
        dateQueryType:'proposed_date',
        chartType:'PIE'
      }
    };
  },
  created() {
    //日期类型
    this.getDictItemTree('DREAM_DATE_STAT_TYPE',false).then(response => {
      this.dateQueryTypeOptions = response;
    });
    //this.initChart();
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
      getDreamStatList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          if(this.queryParams.chartType=='PIE'){
            response.chartType='PIE';
          }else{
            response.chartType='BAR';
          }
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
