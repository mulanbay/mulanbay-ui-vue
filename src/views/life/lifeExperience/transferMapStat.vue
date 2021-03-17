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
      <el-form-item label="图表类型" prop="mapType">
        <el-select
          v-model="queryParams.mapType"
          placeholder="图表类型"
          clearable
          @change="handleQuery"
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in mapTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['life:lifeExperience:transferMapStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

  <!--图表数据-->
  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />

  </div>

</template>

<script>
  import {getLifeExperienceTransferMapStat} from "@/api/life/lifeExperience";
  import {createChinaTransferMapChart,createWorldTransferMapChart} from "@/utils/echartsMapStat";
  import {chartProps} from "@/utils/echarts";
  import {deepClone} from "@/utils/index";
  import '@/components/echarts/map/china'
  import '@/components/echarts/map/world'
  import * as echarts from 'echarts';
  import resize from '../../dashboard/mixins/resize.js'

export default {
  name: "LifeExperienceTransferMapStat",
  mixins: [resize],
  props: chartProps,
  mounted() {
     //this.initChart();
  },
  beforeDestroy() {
    if (!this.chart) {
        return
    }
    this.chart.dispose()
    this.chart = null;
  },
  data() {
    return {
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      chart: null,
      typesOptions:[],
      mapTypeOptions:[
        {
          id: 'CHINA',
          text: '中国'
        },
        {
          id: 'WORLD',
          text: '世界'
        }
      ],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        mapType:'CHINA'
      }
    };
  },
  created() {
    this.initChart();
    this.getEnumTree('ExperienceType','FIELD',false).then(response => {
      this.typesOptions = response;
    });
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
      let qp = this.addDateRange(this.queryParams, this.dateRange);
      let acQueryParams = deepClone(qp);
      if(acQueryParams.types!=null){
        acQueryParams.types = acQueryParams.types.join(',');
      }
      getLifeExperienceTransferMapStat(acQueryParams).then(
        response => {
          //组装chart数据
          if(this.chart==null){
            this.chart = echarts.init(document.getElementById(this.id));
          }
          switch(this.queryParams.mapType){
            case 'CHINA':
              createChinaTransferMapChart(response,this.chart);
              break;
            default:
              createWorldTransferMapChart(response,this.chart);
          }
          this.loading.close();
        }
      );
    }
  }
};
</script>
