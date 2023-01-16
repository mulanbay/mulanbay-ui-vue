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
      <el-form-item label="业务类型" prop="behaviorType">
       <el-select
        v-model="queryParams.behaviorType"
        style="width: 120px"
        clearable
        placeholder="请选择">
         <el-option
           v-for="dict in behaviorTypeOptions"
           :key="dict.id"
           :label="dict.text"
           :value="dict.id"
         />
       </el-select>
      </el-form-item>
      <el-form-item label="选取配置" prop="configIds">
        <treeselect
         v-model="queryParams.configIds"
         style="width: 240px"
         multiple
         clearable
         :options="configIdsOptions"
         :disable-branch-nodes="true"
         :show-count="true"
         :searchable="true"
         placeholder="请选择配置" />
      </el-form-item>
      <el-form-item label="忽略短语" prop="ignoreShort">
        <el-switch v-model="queryParams.ignoreShort"  @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['consume:buyRecord:wordCloudStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />

  </div>

</template>

<script>
  import {getUserOperationConfigTree,getUserOperationConfigWordCloudStat} from "@/api/behavior/userOperationConfig";
  import {getUserBehaviorTypeTree} from "@/api/behavior/userBehaviorConfig";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import * as echarts from 'echarts';
  import resize from '../../dashboard/mixins/resize.js'
  import {chartProps,createWorldCloudChart} from "@/utils/echarts";
  import "echarts-wordcloud/dist/echarts-wordcloud";
  import "echarts-wordcloud/dist/echarts-wordcloud.min";

export default {
  name: "WordCloudStat",
  mixins: [resize],
  props: chartProps,
  components: {
    Treeselect
  },
  data() {
    return {
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //图表数据
      chart: null,
      behaviorTypeOptions:[],
      configIdsOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        name: undefined,
        field:'goodsName',
        ignoreShort:true,
        picWidth:screen.width-250,
        picHeight:screen.height-300
      }
    };
  },
  created() {
    this.wordCloudStat();
    getUserBehaviorTypeTree(false).then(response => {
      this.behaviorTypeOptions = response;
    });
    getUserOperationConfigTree(false).then(response => {
      this.configIdsOptions = response;
    });
  },
  methods: {
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.wordCloudStat();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.wordCloudStat();
    },
    wordCloudStat() {
      this.openLoading();
      let acQueryParams = this.addDateRange(this.queryParams, this.dateRange);
      acQueryParams.startTime = acQueryParams.startDate+' 00:00:00';
      acQueryParams.endTime = acQueryParams.endDate+' 23:59:59';
      let configIds = acQueryParams.configIds;
      if(configIds!=null&&configIds.length>0){
        acQueryParams.configIds = configIds.join(',');
      }else{
        acQueryParams.configIds = undefined;
      }
      getUserOperationConfigWordCloudStat(acQueryParams).then(
        response => {
          //组装chart数据
          if (this.chart == null) {
            this.chart = echarts.init(document.getElementById(this.id));
          }
          createWorldCloudChart(response,this.chart);
          this.loading.close();
        }
      );
    }
  }
};
</script>
