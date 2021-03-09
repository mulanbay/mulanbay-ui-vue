<template>
  <div class="app-container">
    <el-table :data="buyRecordList" v-loading="loading">
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" min-width="200" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span v-if="row.keywords != null">
           ★
          </span>
          <span>{{ row.goodsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总价" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.totalPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="购买日期" align="center" width="190">
        <template slot-scope="{row}">
          <span>{{ row.buyDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺名称" align="center" width="90" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.shopName }}</span>
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

  </div>
</template>

<script>
  import {buyRecord as getBuyRecordList} from "@/api/fund/budgetSnapshot";

export default {
  name: "BudgetSnapshotBuyRecord",
  props: {
    //父层带过来的值
    snapshotData: {
      snapshotId: undefined
    }
  },
  data() {
    return {
      // 总条数
      total: 0,
      // 列表记录
      buyRecordList:[],
      // 遮罩层
      loading: true,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        snapshotId:undefined
      }
    };
  },
  created() {
    this.handleReceiveData(this.snapshotData);
  },
  //监听父层带过来的值
  watch:{
    snapshotData(newVal,oldVal){
      this.snapshotData = newVal;
      this.handleReceiveData(this.snapshotData);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.snapshotId = data.snapshotId;
      this.queryParams.page = 1;
      this.buyRecordList=[];
      this.getList();
    },
    /** 列表 */
    getList(){
      this.loading = true;
      getBuyRecordList(this.queryParams).then(
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
