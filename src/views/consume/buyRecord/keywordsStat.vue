<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="购买日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          unlink-panels
          @change="getBuyRecordKeywordsTreeselect"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="商品标签" prop="keywords">
        <el-select
          v-model="queryParams.keywords"
          placeholder="商品标签"
          clearable
          size="small"
          style="width: 240px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in keywordsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="days"
          placeholder="更多标签"
          clearable
          size="small"
          style="width: 120px"
          @change="getBuyRecordKeywordsTreeselect"
        >
          <el-option
            v-for="dict in daysOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="商品类型" prop="goodsType">
        <el-select
          v-model="queryParams.goodsType"
          placeholder="商品类型"
          clearable
          size="small"
          style="width: 240px"
          @change="getSubGoodsTypeTreeselect"
        >
          <el-option
            v-for="dict in goodsTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="商品子类" clearable  prop="subGoodsType">
        <el-select
          v-model="queryParams.subGoodsType"
          placeholder="商品子类"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in subGoodsTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['consume:buyRecord:keywordsStat']">统计</el-button>
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
  import {getBuyRecordKeywordsTree,getBuyRecordKeywordsStat,getBuyRecordKeywordsDetailStat} from "@/api/consume/buyRecord";
  import {getGoodsTypeTree} from "@/api/consume/goodsType";
  import {getBuyTypeTree} from "@/api/consume/buyType";
  import {getDay} from "@/utils/datetime";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "KeywordsStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     this.initChart();
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //图表数据
      chartData:{},
      //商品类型(搜索和表单是同一个)
      goodsTypeOptions:[],
      //搜索条件的商品子类型
      subGoodsTypeOptions:[],
      //标签
      keywordsOptions:[],
      //标签选择天数
      days:undefined,
      //加载层配置
      loadingOptions: this.loadingOptions,
      //时间选取器
      daysOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        name: undefined,
        chartType: 'PIE',
        groupField:'goods_type_id',
        type:'TOTALPRICE'
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getGoodsTypeTreeselect();
    //请求方式
    this.getDictItemTree('TAGS_DAYS_OPTION',false).then(response => {
      this.daysOptions = response;
    });
    this.getBuyRecordKeywordsTreeselect();
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
    /** 查询搜索条件中的商品大类下拉树结构 */
    getGoodsTypeTreeselect() {
      getGoodsTypeTree(0,'COMMON',false).then(response => {
        this.goodsTypeOptions = response;
      });
    },
    /** 查询搜索条件中的商品子类下拉树结构 */
    getSubGoodsTypeTreeselect(pid) {
      if(pid===undefined||pid===null||pid===''){
        this.subGoodsTypeOptions = [];
        this.queryParams.subGoodsType = undefined;
      }else{
        getGoodsTypeTree(pid,'COMMON',false).then(response => {
          this.subGoodsTypeOptions = response;
        });
      }
    },
    /** 查询商品标签下拉树结构 */
    getBuyRecordKeywordsTreeselect() {
      let startDate=undefined;
      let endDate=undefined;
      if(!this.isObjectEmpty(this.days)){
        endDate = getDay(0);
        startDate = getDay(0-parseInt(this.days));
      }
      getBuyRecordKeywordsTree(startDate,endDate,false).then(response => {
        this.keywordsOptions = response;
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
      const keywords = this.queryParams.keywords;
      if(this.isObjectEmpty(keywords)){
        this.getBuyRecordKeywordsStatChart();
      }else{
        this.getBuyRecordKeywordsStatDetailChart();
      }
    },
    /** 以标签分组统计 */
    getBuyRecordKeywordsStatChart() {
      this.openLoading();
      getBuyRecordKeywordsStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          response.chartType='MIX_LINE_BAR';
          this.chartData = response;
          this.loading.close();
        }
      )
    },
    /** 以标签明细的类型统计 */
    getBuyRecordKeywordsStatDetailChart() {
      //设置为0
      this.dateRange =[];
      this.openLoading();
      getBuyRecordKeywordsDetailStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          this.chartData = response;
          this.loading.close();
        }
      )
    }
  }
};
</script>
