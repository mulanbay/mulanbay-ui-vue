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
      <el-form-item label="类型" prop="types">
        <el-select
          v-model="queryParams.types"
          placeholder="类型"
          clearable
          multiple
          collapse-tags
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in typesOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计字段" prop="field">
        <el-select
          v-model="queryParams.field"
          placeholder="统计字段"
          size="small"
          style="width: 120px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in fieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['life:lifeExperience:wordCloudStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />

  </div>
</template>

<script>
  import {getLifeExperienceWouldCloudStat} from "@/api/life/lifeExperience";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import resize from '../../dashboard/mixins/resize.js'
  import {chartProps,createWorldCloudChart} from "@/utils/echarts";
  import "echarts-wordcloud/dist/echarts-wordcloud";
  import "echarts-wordcloud/dist/echarts-wordcloud.min";

export default {
  name: "LifeExperienceWordCloudStat",
  mixins: [resize],
  props: chartProps,
  data() {
    return {
      //图表数据
      chart: null,
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //统计字段
      fieldOptions:[],
      typesOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        // picWidth:screen.width-250,
        // picHeight:screen.height-300
        field:'tags'
      }
    };
  },
  created() {
    this.wordCloudStat();
    this.getEnumTree('ExperienceType','FIELD',false).then(response => {
      this.typesOptions = response;
    });
    this.getDictItemTree('LIFE_EXPERIENCE_WORDCLOUD_FIELD',false).then(response => {
      this.fieldOptions = response;
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
      let qp = this.addDateRange(this.queryParams, this.dateRange);
      let acQueryParams = deepClone(qp);
      if(acQueryParams.types!=null){
        acQueryParams.types = acQueryParams.types.join(',');
      }
      getLifeExperienceWouldCloudStat(acQueryParams).then(
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
