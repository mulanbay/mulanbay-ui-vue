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
      <el-form-item label="统计字段" prop="field">
        <el-select
          v-model="queryParams.field"
          placeholder="统计字段"
          size="small"
          style="width: 240px"
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
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['food:diet:statWordCloud']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

  <!--图表数据-->
    <div id="container"
					style="min-width: 400px; height: 100%; margin: 0 auto">
          <img :src="codeUrl" height="100%" width="100%"/>
    </div>
  </div>

</template>

<script>
  import {statDietWordCloud} from "@/api/food/diet";

export default {
  name: "StatWordClouds",
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
      // 词云图片
      codeUrl: "",
      foodTypeOptions:[],
      dietTypeOptions:[],
      dietSourceOptions:[],
      //统计字段
      fieldOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        name: undefined,
        field:'foods',
        picWidth:screen.width-250,
        picHeight:screen.height-400
      }
    };
  },
  created() {
    this.getDictItemTree('DIET_WORD_CLOUD_FIELD',false).then(response => {
      this.fieldOptions = response;
    });
    this.wordCloudStat();
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
      this.wordCloudStat();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.wordCloudStat();
    },
    wordCloudStat() {
      this.openLoading();
      statDietWordCloud(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.codeUrl = "data:image/gif;base64," + response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
