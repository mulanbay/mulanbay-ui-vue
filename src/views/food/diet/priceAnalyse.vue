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
      <el-form-item label="统计分组" prop="dateGroupTypeStr">
        <el-select
          v-model="queryParams.dateGroupTypeStr"
          placeholder="统计分组"
          collapse-tags
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in dateGroupTypeStrOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="价格预测" prop="predict">
        <el-switch v-model="queryParams.predict" :disabled="moreCdn==true||(queryParams.dateGroupTypeStr!='MONTH'&&queryParams.dateGroupTypeStr!='YEAR')"></el-switch>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="食物类型" prop="foodType">
        <el-select
          v-model="queryParams.foodType"
          placeholder="食物类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in foodTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.dietType"
          placeholder="餐次"
          clearable
          size="small"
          style="width: 115px"
        >
          <el-option
            v-for="dict in dietTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="食物来源" prop="dietSource">
        <el-select
          v-model="queryParams.dietSource"
          placeholder="食物来源"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in dietSourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="价格去零" prop="minPrice">
        <el-switch v-model="queryParams.minPrice" active-value="0" inactive-value="null" ></el-switch>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="补全日期" prop="compliteDate">
        <el-switch v-model="queryParams.compliteDate"  @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['food:diet:priceAnalyse']">统计</el-button>
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
  import {getDietPriceAnalyse} from "@/api/food/diet";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "DietPriceAnalyse",
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
      foodTypeOptions:[],
      dietTypeOptions:[],
      dietSourceOptions:[],
      //分组
      dateGroupTypeStrOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        minPrice:0,
        dateGroupTypeStr:'MONTH',
        compliteDate:true,
        predict: false
      }
    };
  },
  created() {
    this.getDictItemTree('DIET_PRICE_ANALYSE_FIELD',false).then(response => {
      this.dateGroupTypeStrOptions = response;
    });
    this.initChart();
    this.getEnumTree('FoodType','FIELD',false).then(response => {
      this.foodTypeOptions = response;
    });
    this.getEnumTree('DietType','FIELD',false).then(response => {
      this.dietTypeOptions = response;
    });
    this.getEnumTree('DietSource','FIELD',false).then(response => {
      this.dietSourceOptions = response;
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
      if(qp.minPrice=='null'){
        qp.minPrice=undefined;
      }
      if(this.moreCdn==true||(this.queryParams.dateGroupTypeStr!='MONTH'&&this.queryParams.dateGroupTypeStr!='YEAR')){
        //无法进行条件查询预测
        qp.predict = false;
      }
      getDietPriceAnalyse(qp).then(
        response => {
          //组装chart数据
          var dg = this.queryParams.dateGroupTypeStr;
          if(dg=='DAYCALENDAR'||dg=='DIET_SOURCE'||dg=='FOOD_TYPE'||dg=='DIET_TYPE'){
            response.chartType='PIE';
          }else {
            response.chartType='MIX_LINE_BAR';
          }
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
