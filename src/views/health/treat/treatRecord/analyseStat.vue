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
      <el-form-item label="疾病标签" prop="tags">
        <el-select
          v-model="queryParams.tags"
          placeholder="疾病标签"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in tagsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
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
      <el-form-item label="图表类型" prop="chartType">
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
      <el-form-item label="看病类型" prop="treatType">
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
      <el-form-item label="统计分类" prop="groupField">
        <el-select
          v-model="queryParams.groupField"
          placeholder="统计分类"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in groupFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.groupType"
          placeholder="字段类型"
          clearable
          size="small"
          style="width: 100px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.feeField"
          placeholder="统计字段"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option
            v-for="dict in feeFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否有病" prop="sick">
        <el-select
          v-model="queryParams.sick"
          placeholder="是否有病"
          clearable
          size="small"
          style="width: 100px"
        >
          <el-option
            v-for="dict in booleanOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['sport:sportExercise:dateStat']">统计</el-button>
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
  import {getTreatCategoryTree,getTreatRecordAnalyseStat,getTreatRecordTagsTree} from "@/api/health/treat/treatRecord";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "TreatRecordAnalyseStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //加载层配置
      loadingOptions: this.loadingOptions,
      //图表数据
      chartData:{},
      //运动类型
      feeFieldOptions:[],
      //统计分类
      groupFieldOptions:[],
      groupTypeOptions:[],
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
      booleanOptions:this.booleanOptions,
      //疾病标签
      tagsOptions:[],
      treatTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        groupField:'diagnosed_disease',
        groupType:'COUNT',
        feeField:'total_fee',
        chartType:'PIE'
      }
    };
  },
  created() {
    this.getDictItemTree('TREAT_ANALYSE_GROUP_FIELD',false).then(response => {
      this.groupFieldOptions = response;
    });
    this.getDictItemTree('TREAT_DATE_STAT_FIELD',false).then(response => {
      this.feeFieldOptions = response;
    });
    this.getDictItemTree('TREAT_ANALYSE_GROUP_TYPE',false).then(response => {
      this.groupTypeOptions = response;
    });
    this.getEnumTree('TreatType','ORDINAL',false).then(response => {
      this.treatTypeOptions = response;
    });
    this.initChart();
    this.getTreatRecordTagsTreeselect();
  },
  methods: {
    /** 查询疾病标签下拉树结构 */
    getTreatRecordTagsTreeselect() {
      getTreatRecordTagsTree(false).then(response => {
        this.tagsOptions = response;
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
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    initChart() {
      this.openLoading();
      getTreatRecordAnalyseStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          const chartType = this.queryParams.chartType;
          response.chartType=chartType;
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
