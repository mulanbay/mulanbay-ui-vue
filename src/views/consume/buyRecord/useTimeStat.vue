<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item v-if="moreCdn==true" label="统计分组" prop="groupField">
        <el-select
          v-model="queryParams.groupField"
          placeholder="字段"
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in groupFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
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
          unlink-panels
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['consume:buyRecord:useTimeStat']">搜索</el-button>
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
          <span class="link-type" @click="handleBuyRecordInfo(row)">{{ formatGoodsName(row) }}</span>
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
      <el-table-column label="使用时长" :show-overflow-tooltip="true" width="120">
        <template slot-scope="{row}">
          <span :style="{'color':getDaysColor(row.days)}">{{ formatUseDuration(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="寿命比对" width="80px" align="center" >
        <template slot-scope="{row}">
          <span class="link-type" @click="handleCompare(row)"><svg-icon icon-class="compare"/></span>
        </template>
      </el-table-column>
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
    <el-dialog :title="cascadeTitle" width="850px" :visible.sync="cascadeOpen" append-to-body customClass="customDialogCss">
      <goods-cascade :buyRecordData="buyRecordData"/>
    </el-dialog>


  </div>
</template>

<script>
  import {getBuyRecordUseTimeStat,getBuyRecordKeywordsTree,getBuyRecord} from "@/api/consume/buyRecord";
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
      //分组字段
      groupFieldOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        groupField:'goods_type_id'
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
    this.getDictItemTree('BUY_TYPE_GROUP_FIELD',false).then(response => {
      this.groupFieldOptions = response;
    });
    this.getDictItemTree('SECONDHAND',false).then(response => {
      this.querySecondhandTypes = response;
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
    /** 商品名称 */
    formatGoodsName(row) {
      //先计算出days供下面的方法使用
      //无法使用this的内部方法，一时未找到解决方法，因此里面的方法目前重复写一遍
      const dd = new Date(Date.parse(row.deleteDate.replace(/-/g,"/")));
      const bd = new Date(Date.parse(row.buyDate.replace(/-/g,"/")));
      var days = (parseInt(dd - bd)) / (1000*3600*24);
      row.days = days;
      return row.goodsName;
    },
    /** 使用时长 */
    formatUseDuration(row) {
      row.color='red';
      var time = formatDays(row.days);
      return time;
    },
    /** 时长的字段颜色 */
    getDaysColor(days) {
      //days需要先被计算出来这里才能使用
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
      var pp ='';
      if(row.soldPrice==null){
      	pp = (row.totalPrice)/row.days;
      }else{
      	pp = (row.totalPrice-row.soldPrice)/row.days;
      }
      return '￥'+pp.toFixed(2);
    },
    /** 记录详情 */
    handleBuyRecordInfo(row){
      this.cascadeTitle = '商品级联';
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
      getBuyRecordUseTimeStat(this.addDateRange(this.queryParams, this.dateRange)).then(
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
