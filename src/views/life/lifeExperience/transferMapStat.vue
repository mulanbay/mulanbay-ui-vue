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
      <el-form-item label="出发城市" prop="startCity">
        <el-select
          v-model="queryParams.startCity"
          placeholder="出发城市"
          clearable
          size="small"
          style="width: 120px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in startCityOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
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
  import {getLifeExperienceStartCityTree,getLifeExperienceTransferMapStat} from "@/api/life/lifeExperience";
  import {createSingleTransferMapChart,createDoubleTransferMapChart} from "@/utils/echartsMapStat";
  import {chartProps} from "@/utils/echarts";
  import {deepClone} from "@/utils/index";

  import * as echarts from 'echarts';
  import resize from '../../dashboard/mixins/resize.js'


export default {
  name: "TransferMapStat",
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
      startCityOptions:[],
      typesOptions:[],
      mapTypeOptions:[
        {
          id: 'TRANSFER_SINGLE',
          text: '单向'
        },
        {
          id: 'TRANSFER_DOUBLE',
          text: '双向'
        }
      ],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        mapType:'TRANSFER_SINGLE'
      }
    };
  },
  created() {
    this.getLifeExperienceStartCityTreeselect();
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
    /** 查询出发城市下拉树结构 */
    getLifeExperienceStartCityTreeselect() {
      getLifeExperienceStartCityTree(false).then(response => {
        this.startCityOptions = response;
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
          if(this.queryParams.mapType=='TRANSFER_DOUBLE'){
            createDoubleTransferMapChart(response,this.chart);
          }else{
            createSingleTransferMapChart(response,this.chart);
          }
          this.loading.close();
        }
      );
    }
  }
};
</script>
