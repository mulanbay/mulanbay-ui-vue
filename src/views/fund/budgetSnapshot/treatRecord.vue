<template>
  <div class="app-container">
    <el-table :data="treatRecordList" v-loading="loading">
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.treatTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病症状" width="160" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.disease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="看病日期" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="费用" width="120">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.totalFee) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="医院" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.hospital }}</span>
        </template>
      </el-table-column>
      <el-table-column label="科室" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.department }}</span>
        </template>
      </el-table-column>
      <el-table-column label="器官">
        <template slot-scope="{row}">
          <span>{{ row.organ }}</span>
          <span class="link-type" @click="showBodyAbnormalRecordAnalyse(row.organ,'ORGAN')"><i class="el-icon-s-promotion" /></span>
        </template>
      </el-table-column>
      <el-table-column label="确诊疾病"  min-width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.diagnosedDisease }}</span>
          <span class="link-type" @click="showBodyAbnormalRecordAnalyse(row.diagnosedDisease,'DISEASE')"><i class="el-icon-s-promotion" /></span>
        </template>
      </el-table-column>
      <el-table-column label="是否有病" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.isSick" disabled=""></el-switch>
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
  import {treatRecord as getTreatRecordList} from "@/api/fund/budgetSnapshot";

export default {
  name: "BudgetSnapshotTreatRecord",
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
      treatRecordList:[],
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
      this.treatRecordList=[];
      this.getList();
    },
    /** 列表 */
    getList(){
      this.loading = true;
      getTreatRecordList(this.queryParams).then(
        response => {
          this.treatRecordList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    }
  }
};
</script>
