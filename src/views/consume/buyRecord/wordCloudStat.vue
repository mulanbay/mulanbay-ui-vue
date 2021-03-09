<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item v-if="moreCdn==true" label="名称检索" prop="roleName">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
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
      <el-form-item v-if="moreCdn==true" label="购买来源" prop="buyType">
        <el-select
          v-model="queryParams.buyType"
          placeholder="购买来源"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in buyTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="商品标签" prop="keywords">
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
      </el-form-item>
      <el-form-item label="购买日期">
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
      <el-form-item label="消费类型" prop="consumeType">
        <el-select
          v-model="queryParams.consumeType"
          placeholder="方式"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in consumeTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.field"
          placeholder="统计字段"
          size="small"
          style="width: 115px"
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
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['consume:buyRecord:wordCloudStat']">统计</el-button>
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
  import {getBuyRecordKeywordsTree,getBuyRecordWordCloudStat} from "@/api/consume/buyRecord";
  import {getGoodsTypeTree} from "@/api/consume/goodsType";
  import {getBuyTypeTree} from "@/api/consume/buyType";

export default {
  name: "BuyRecordWordCloudStat",
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
      //商品类型(搜索和表单是同一个)
      goodsTypeOptions:[],
      //搜索条件的商品子类型
      subGoodsTypeOptions:[],
      //购买来源(搜索和表单是同一个)
      buyTypeOptions:[],
      //消费类型
      consumeTypeOptions:[],
      //商品标签
      keywordsOptions:[],
      //统计字段
      fieldOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        name: undefined,
        field:'goodsName',
        picWidth:screen.width-250,
        picHeight:screen.height-300
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getGoodsTypeTreeselect();
    this.getBuyTypeTreeselect();
    this.getEnumTree('GoodsConsumeType','ORDINAL',false).then(response => {
      this.consumeTypeOptions = response;
    });
    this.getBuyRecordKeywordsTreeselect();
    this.getDictItemTree('BUY_RECORD_WORDCLOUD_FIELD',false).then(response => {
      this.fieldOptions = response;
    });
    this.wordCloudStat();
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
    /** 查询搜索条件中的购买来源下拉树结构 */
    getBuyTypeTreeselect() {
      getBuyTypeTree(0,false).then(response => {
        this.buyTypeOptions = response;
      });
    },
    /** 查询商品标签下拉树结构 */
    getBuyRecordKeywordsTreeselect() {
      getBuyRecordKeywordsTree(this.dateRange[0],false).then(response => {
        this.keywordsOptions = response;
      });
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
      getBuyRecordWordCloudStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.codeUrl = "data:image/gif;base64," + response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
