<template>
  <div class="app-container" v-loading="parentLoading" >
    <el-row :gutter="32">
      <el-card>
        <el-col :span="24" class="card-box">
          <div>
            <el-descriptions class="margin-top" :column="1" :size="'5'" border :labelStyle="{width: '130px'}" title="商品信息">
              <template slot="extra">
                <el-button type="query" icon="el-icon-refresh" size="mini" @click="handleDeleteChildren" v-hasPermi="['consume:buyRecord:deleteChildren']">取消所有关联</el-button>
              </template>
              <el-descriptions-item>
                <template slot="label">
                  <i class="el-icon-star-on"></i>
                  当前商品
                </template>
                <div class="cell">{{ currentBuyRecordGoodsName }}</div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>
      </el-card>

      </br>

      <el-card>
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
          <el-form-item label="只看已关联" prop="compliteDate">
            <el-switch v-model="cascaded"  @change="handleQuery"></el-switch>
          </el-form-item>
          <el-form-item label="购买日期" v-if="moreCdn==true">
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
              :picker-options="datePickerOptions"
            ></el-date-picker>
          </el-form-item>
          <el-form-item v-if="moreCdn==true" label="商品类型" prop="goodsType">
            <el-select
              v-model="queryParams.goodsType"
              placeholder="商品类型"
              clearable
              size="small"
              style="width: 240px"
              @change="getQuerySubGoodsTypeTreeselect"
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
                v-for="dict in querySubGoodsTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['consume:buyRecord:query']">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
          </el-form-item>
        </el-form>

        <!--列表数据-->
        <el-table v-loading="loading" :data="buyRecordList">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
            <template slot-scope="{row}">
              <span>{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" width="400" :show-overflow-tooltip="true">
            <template slot-scope="{row}">
              <span v-if="row.keywords != null">
               ★
              </span>
              <span v-if="row.pid != null" style="color: red;">
               ★
              </span>
              <span v-if="row.id==buyRecordCCData.id">
               <el-tag type="danger">当前商品</el-tag>
              </span>
              <span v-if="row.pid==buyRecordCCData.id">
               <el-tag type="success">已关联</el-tag>
              </span>
              <span v-if="row.secondhand==true" style="color: green;">
               <el-tag type="warning">二手</el-tag>
              </span>
              <span class="link-type" @click="handleUpdate(row)">{{ row.goodsName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总价" align="center" width="95">
            <template slot-scope="{row}">
              <span>{{ formatMoney(row.totalPrice) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="购买来源" align="center" width="95">
            <template slot-scope="{row}">
              <span>{{ isObjectEmpty(row.buyType) ? '--':row.buyType.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品类型" align="center" width="95">
            <template slot-scope="{row}">
              <span>{{ isObjectEmpty(row.goodsType) ? '--':row.goodsType.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" fixed="right" width="80" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-setting"
                @click="handleSetParent(scope.row)"
                v-hasPermi="['consume:buyRecord:setParent']"
              >关联</el-button>
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

      </el-card>
    </el-row>
  </div>
</template>

<script>
  import {fetchList,getBuyRecord,setParentBuyRecord,deleteChlidrenBuyRecord} from "@/api/consume/buyRecord";
  import {getGoodsTypeTree} from "@/api/consume/goodsType";

export default {
  name: "BuyRecordChildrenGoods",
  props: {
      //父层带过来的信息值
      buyRecordCCData: {id:undefined}
  },
  components: {
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
      cascaded:true,
      parentLoading:false,
      loading:false,
      currentBuyRecordGoodsName:undefined,
      // 总条数
      total: 0,
      // 列表记录
      buyRecordList:[],
      //商品类型(搜索和表单是同一个)
      goodsTypeOptions:[],
      //搜索条件的商品子类型
      querySubGoodsTypeOptions:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        sortField: 'buyDate',
        sortType: 'desc',
        userId:undefined,
        pid:undefined
      },
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions
    };
  },
  created() {
    this.handleReceiveData(this.buyRecordCCData);
    //加载查询条件和表单的
    this.getGoodsTypeTreeselect();
  },
  //监听父层带过来的账户信息值
  watch:{
    buyRecordCCData: {
      deep: true,
      handler(val) {
        this.buyRecordCCData =val;
        this.handleReceiveData(this.buyRecordCCData);
      }
    }
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
    handleClick(tab, event) {
      //console.log(tab, event);
    },
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.loadBuyRecord(data.id);
    },
    /** 查询搜索条件中的商品大类下拉树结构 */
    getGoodsTypeTreeselect() {
      getGoodsTypeTree(0,'COMMON',false).then(response => {
        this.goodsTypeOptions = response;
      });
    },
    /** 查询搜索条件中的商品子类下拉树结构 */
    getQuerySubGoodsTypeTreeselect(pid) {
      if(pid===undefined||pid===null||pid===''){
        this.querySubGoodsTypeOptions = [];
        this.queryParams.subGoodsType = undefined;
      }else{
        getGoodsTypeTree(pid,'COMMON',false).then(response => {
          this.querySubGoodsTypeOptions = response;
        });
      }
    },
    //加载明细
    loadBuyRecord(id){
      if(id==undefined|| id==null){
        return;
      }
      getBuyRecord(id).then(response => {
        this.currentBuyRecordGoodsName = response.goodsName;
        this.cascaded = true;
        this.handleQuery();
      });
    },
    /** 设置为父级按钮操作 */
    handleSetParent(row){
      if(this.buyRecordCCData.id==row.id){
        this.msgError('不能设置自己为父级商品');
        return;
      }
      let data={
        pid:this.buyRecordCCData.id,
        id:row.id
      };
      setParentBuyRecord(data).then(response => {
        this.msgSuccess('设置成功');
        this.getList();
      });
    },
    /** 取消下级关联按钮操作 */
    handleDeleteChildren(){
      let data={
        pid:this.buyRecordCCData.id
      };
      deleteChlidrenBuyRecord(data).then(response => {
        this.msgSuccess('取消成功');
        this.getList();
      });
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
    /** 查询列表 */
    getList() {
      this.loading = true;
      if(this.cascaded==true){
        this.queryParams.pid = this.buyRecordCCData.id;
      }else{
        this.queryParams.pid = null;
      }
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.buyRecordList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    }
  }
};
</script>
<style lang="scss" scoped>
@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
