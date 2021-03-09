<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="旅行日期">
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
      <el-form-item v-if="moreCdn==true" label="所呆天数">
          <el-input-number v-model="queryParams.minDays" clearable :min="0" label="" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.maxDays" clearable :min="0" label="" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item v-if="moreCdn==true&&'LC_NAME'==queryParams.mapType" label="类型" prop="types">
        <el-select
          v-model="queryParams.types"
          placeholder="类型"
          clearable
          multiple
          collapse-tags
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in typesOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="地图类型" prop="mapType">
        <el-select
          v-model="queryParams.mapType"
          placeholder="地图类型"
          clearable
          size="small"
          style="width: 240px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in mapTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计类型" prop="statType">
        <el-select
          v-model="queryParams.statType"
          placeholder="统计类型"
          clearable
          size="small"
          style="width: 240px"
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
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['life:lifeExperience:mapStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

  <!--图表数据-->
  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />

  </div>

</template>

<script>
  import {getLifeExperienceMapStat} from "@/api/life/lifeExperience";
  import {createLocationMapChart,createNTLocationMapChart,createMapChart} from "@/utils/echartsMapStat";
  import {chartProps} from "@/utils/echarts";
  import {deepClone} from "@/utils/index";

  import * as echarts from 'echarts';
  import '@/components/echarts/map/china'
  import '@/components/echarts/map/world'
  import resize from '../../dashboard/mixins/resize.js'

export default {
  name: "LifeExperienceMapStat",
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
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      chart: null,
      typesOptions:[],
      mapTypeOptions:[],
      statTypeOptions:[
        {
          id: 'DAYS',
          text: '天数'
        },
        {
          id: 'COUNT',
          text: '次数'
        },
        {
          id: 'COST',
          text: '花费'
        }
      ],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        mapType:'CHINA',
        statType:'DAYS'
      }
    };
  },
  created() {
    this.getDictItemTree('STAT_MAP_TYPE',false).then(response => {
      this.mapTypeOptions = response;
    });
    this.initChart();
    this.getEnumTree('ExperienceType','FIELD',false).then(response => {
      this.typesOptions = response;
    });
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
      getLifeExperienceMapStat(acQueryParams).then(
        response => {
          //组装chart数据
          this.chart = echarts.init(document.getElementById(this.id));
          const mapType = this.queryParams.mapType;
          if(mapType=='LOCATION'||mapType=='LC_NAME'){
            const n = response.dataList==null ? 0: response.dataList.length;
            if(n<=20){
              createNTLocationMapChart(response,this.chart);
            }else{
              //数量过多则不显示tooltip，只是显示最高的几个
              createLocationMapChart(response,this.chart);
            }
          }else{
            response.backgroundColor='#404a59';
            createMapChart(response,this.chart);
          }
          this.loading.close();
        }
      );
    }
  }
};
</script>
