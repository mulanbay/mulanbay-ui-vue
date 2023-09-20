<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称检索" prop="roleName">
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
      <el-form-item v-if="moreCdn==true" label="商品子类" prop="subGoodsType">
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
      <el-form-item v-if="moreCdn==true" label="是否二手" prop="secondhand">
        <el-select
          v-model="queryParams.secondhand"
          placeholder="二手类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in querySecondhandTypes"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="购买日期" v-if="moreCdn==true" >
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
          unlink-panels
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="排序方式" prop="sortField">
        <el-select
          v-model="queryParams.sortField"
          placeholder="字段"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in querySortFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.sortType"
          placeholder="方式"
          clearable
          size="small"
          style="width: 115px"
        >
          <el-option
            v-for="dict in querySortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['consume:buyRecord:useTimeList']">搜索</el-button>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleStat" v-hasPermi="['consume:buyRecord:useTimeStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="buyRecordList">
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" width="400" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span v-if="row.keywords != null">
           <el-tag type="success">{{ row.keywords | keywordsTagFilter }}</el-tag>
          </span>
          <span v-if="row.secondhand==true" style="color: green;">
           <el-tag type="warning">二手</el-tag>
          </span>
          <span class="link-type" @click="handleBuyRecordInfo(row)">{{ row.goodsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="购买时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.buyDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="售出/作废时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.deleteDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用时长" align="center"  :show-overflow-tooltip="true" width="120">
        <template slot-scope="{row}">
          <span :style="{'color':getUseTimeColor(row.useTime)}">{{ formatUseTime(row.useTime) }}</span>
        </template>
      </el-table-column>
      <!--
      <el-table-column label="寿命比对" width="80px" align="center" >
        <template slot-scope="{row}">
          <span class="link-type" @click="handleCompare(row)"><svg-icon icon-class="compare"/></span>
        </template>
      </el-table-column>
      -->
      <el-table-column label="买入价格" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.totalPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="售出价格" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.soldPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="折旧率" :show-overflow-tooltip="true"  align="center">
        <template slot-scope="{row}">
          <span>{{ formatDepreciation(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="每天花费" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ formatDailyCost(row) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 商品寿命比对 -->
    <el-dialog :title="ltcTitle" width="500px" :visible.sync="ltcOpen">
      <lifetime-compare :buyRecordData="buyRecordData"/>
    </el-dialog>

    <!--消费记录详情,商品级联 -->
    <el-dialog :title="cascadeTitle" width="80%" :visible.sync="cascadeOpen" append-to-body customClass="customDialogCss">
      <goods-cascade :buyRecordData="buyRecordData"/>
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-close" type="danger" @click="cascadeOpen = false" >关闭</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
  import {getBuyRecordUseTimeList,getBuyRecordKeywordsTree,getBuyRecord} from "@/api/consume/buyRecord";
  import {aiMatch} from "@/api/consume/goodsLifetime";
  import {getGoodsTypeTree} from "@/api/consume/goodsType";
  import {getBuyTypeTree} from "@/api/consume/buyType";
  import {getPercent} from "@/utils/mulanbay";
  import {formatDays} from "@/utils/datetime";
  import LifetimeCompare from '../goodsLifetimeCompare'
  import BuyRecordDetail from '../../common/keyValueTable'
  import GoodsCascade from './cascade/index'

export default {
  name: "BuyRecordUseTimeStat",
  components: {
    'buyRecord-detail':BuyRecordDetail,
    'lifetime-compare':LifetimeCompare,
    'goods-cascade':GoodsCascade
  },
  filters: {
    keywordsTagFilter:function(keywords){
      const ss = keywords.split(',');
      const first = ss[0];
      return first;
    }
  },
  data() {
    return {
      //寿命比对
      ltcTitle:'',
      ltcOpen:false,
      buyRecordData:{},
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //商品级联
      cascadeTitle:'',
      cascadeOpen:false,
      buyRecordData:{id:undefined},
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 总条数
      buyRecordList:[],
      //商品类型(搜索和表单是同一个)
      goodsTypeOptions:[],
      //搜索条件的商品子类型
      subGoodsTypeOptions:[],
      //购买来源(搜索和表单是同一个)
      buyTypeOptions:[],
      //消费类型
      consumeTypeOptions:[],
      //是否二手
      querySecondhandTypes:[],
      //排序字段
      querySortFieldOptions:[],
      querySortTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        sortField: 'deleteDate',
        sortType: 'desc'
      },
    };
  },
  created() {
    this.getList();
    //加载查询条件和表单的
    this.getGoodsTypeTreeselect();
    this.getBuyTypeTreeselect();
    this.getEnumTree('GoodsConsumeType','FIELD',false).then(response => {
      this.consumeTypeOptions = response;
    });
    this.getDictItemTree('SECONDHAND',false).then(response => {
      this.querySecondhandTypes = response;
    });
    this.getDictItemTree('BUY_RECORD_USE_TIME_SORT_FIELD',false).then(response => {
      this.querySortFieldOptions = response;
    });
    this.getDictItemTree('SORT_TYPE',false).then(response => {
      this.querySortTypeOptions = response;
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
    /** 统计 */
    handleStat(){
      //路由定向
      this.$router.push({name:'BuyRecordUseTimeStat',query: {}})
    },
    /** 计算天数 */
    calsDays(useTime){
      return useTime / (24*3600*1000);
    },
    /** 使用时长 */
    formatUseTime(useTime) {
      let days = this.calsDays(useTime);
      var time = formatDays(days);
      return time;
    },
    /** 时长的字段颜色 */
    getUseTimeColor(useTime) {
      let days = this.calsDays(useTime);
      if(days>=365*10){
        return 'red';
      }else if(days>=365*5){
          return 'green';
      }else if(days>=365){
          return 'purple';
      }else{
        return 'black';
      }
    },
    /** 折旧率 */
    formatDepreciation(row) {
      if(row.soldPrice==undefined||row.soldPrice==null){
        return '--';
      }else{
        const dd = row.soldPrice*10/row.totalPrice;
        const s = dd.toFixed(1)+'折';
        return s;
      }
    },
    /** 每天花费 */
    formatDailyCost(row) {
      let days = this.calsDays(row.useTime);
      var pp ='';
      if(row.soldPrice==null){
      	pp = (row.totalPrice)/days;
      }else{
      	pp = (row.totalPrice-row.soldPrice)/days;
      }
      return '￥'+pp.toFixed(2);
    },
    /** 记录详情 */
    handleBuyRecordInfo(row){
      this.cascadeTitle = '关联商品';
      this.cascadeOpen=true;
      this.buyRecordData = Object.assign({}, this.buyRecordData, {
        id: row.id
      });
    },
    /** 寿命比对 */
    handleCompare(row){
      this.ltcTitle='['+row.goodsName+']寿命比对';
      this.ltcOpen=true;
      this.buyRecordData = Object.assign({}, this.buyRecordData, {
        id: row.id
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      getBuyRecordUseTimeList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.buyRecordList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
  }
};
</script>
