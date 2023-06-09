<template>
  <div class="app-container">
    <el-row :gutter="32">
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
              <span v-if="row.secondhand==true" style="color: green;">
               <el-tag type="warning">二手</el-tag>
              </span>
              <span class="link-type" @click="handleSelect(row)">{{ row.goodsName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="购买日期" align="center" width="190">
            <template slot-scope="{row}">
              <span>{{ row.buyDate }}</span>
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
                icon="el-icon-check"
                @click="handleSelect(scope.row)"
              >选择</el-button>
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
  import {fetchList} from "@/api/consume/buyRecord";
  import {getGoodsTypeTree} from "@/api/consume/goodsType";

export default {
  name: "ChooseGoods",
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
      loading:false,
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
        userId:undefined
      },
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions
    };
  },
  created() {
    //加载查询条件和表单的
    this.getGoodsTypeTreeselect();
    this.handleQuery();
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
    /** 选择按钮操作 */
    handleSelect(row){
      //调用父组件的方法
      this.$emit('selectGoods',row);
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
