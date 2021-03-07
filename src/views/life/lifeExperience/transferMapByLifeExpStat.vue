<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="人生经历" prop="id">
        <el-select
          v-model="queryParams.id"
          placeholder="人生经历"
          clearable
          size="small"
          style="width: 240px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in lifeExperienceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['life:lifeExperience:transferMapByLifeExpStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

  <!--图表数据-->
  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />

  </div>

</template>

<script>
  import {getLifeExperienceTree,getLifeExperienceTransferMapByLifeExpStat} from "@/api/life/lifeExperience";
  import {createDoubleTransferMapChart} from "@/utils/echartsMapStat";
  import * as echarts from 'echarts';
  import '@/components/echarts/map/china'
  import resize from '../../dashboard/mixins/resize.js'


export default {
  name: "TransferMap",
  mixins: [resize],
  props: {
    //父层带过来的账户信息值
    lifeExpData:{
      lifeExperienceId:undefined
    },
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chartTm'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: (document.body.clientHeight - 400).toString() + 'px'
    },
  },
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
      lifeExperienceOptions:[],
      // 查询参数
      queryParams: {
        id:undefined
      }
    };
  },
  created() {
    this.getLifeExperienceTreeselect();
    this.handleReceiveData(this.lifeExpData);
    this.initChart();
  },
  //监听父层带过来的账户信息值
  watch:{
    lifeExpData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.id=data.lifeExperienceId+'';
      this.initChart();
    },
    /** 查询疾病标签下拉树结构 */
    getLifeExperienceTreeselect() {
      getLifeExperienceTree(false).then(response => {
        this.lifeExperienceOptions = response;
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
      getLifeExperienceTransferMapByLifeExpStat(this.queryParams).then(
        response => {
          //组装chart数据
          if(this.chart==null){
            this.chart = echarts.init(document.getElementById(this.id));
          }
          createDoubleTransferMapChart(response,this.chart);
          this.loading.close();
        }
      );
    }
  }
};
</script>
