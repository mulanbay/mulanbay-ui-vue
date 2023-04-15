<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="看病日期">
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
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatRecord:fullStat']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病标签" align="center" width="160" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          {{ row.tags }}
        </template>
      </el-table-column>
      <el-table-column label="看病总次数" width="120" align="center" >
        <template slot-scope="{row}">
          <span v-if="row.totalCount<=3" style="color: green;">
            {{ row.totalCount }}
          </span>
          <span v-else-if="row.totalCount<=5" style="color: purple;">
           {{ row.totalCount }}
          </span>
          <span v-else-if="row.totalCount<=10" style="color: brown;">
           {{ row.totalCount }}
          </span>
          <span v-else style="color: red;">
           {{ row.totalCount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="初次看病时间" width="180" align="center">
        <template slot-scope="{row}">
          <span>{{ row.minTreatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近一次看病时间" width="180" align="center">
        <template slot-scope="{row}">
          <span>{{ row.maxTreatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="看病总时长" width="110" :show-overflow-tooltip="true"  align="center">
        <template slot-scope="{row}">
          <span>{{ formatTotalDays(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="距离现在" width="110" :show-overflow-tooltip="true"  align="center">
        <template slot-scope="{row}">
          <span>{{ formatTillNow(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总费用"  align="center" width="120" >
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.totalFee) }}</span>
        </template>
      </el-table-column>
      <!--
      <el-table-column label="个人支付"  align="center" >
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.personalPaidFee) }}</span>
        </template>
      </el-table-column>
      -->
      <el-table-column label="费用统计" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleFeeDetail(row)"><i class="el-icon-s-data"/></i></span>
        </template>
      </el-table-column>
      <el-table-column label="药品" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDrugList(row)"><i class="el-icon-s-grid"/></i></span>
        </template>
      </el-table-column>
      <el-table-column label="手术" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleOperationList(row)"><i class="el-icon-s-grid"/></i></span>
        </template>
      </el-table-column>
      <el-table-column label="检测报告" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleTreatTest(row)"><i class="el-icon-s-grid"/></i></span>
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

    <!-- 费用详情 -->
    <el-dialog :title="feeDetailTitle" width="1100px" :visible.sync="feeDetailOpen">
      <fee-detail :fullStatData="fullStatData"/>
    </el-dialog>

    <!-- 药品列表页面 -->
    <el-dialog :title="drugListTitle" width="900px" :visible.sync="drugListOpen"  append-to-body>
      <drug-list
        :treatRecordData="treatRecordData"
      />
    </el-dialog>

    <!-- 手术列表页面 -->
    <el-dialog :title="operationListTitle" width="900px" :visible.sync="operationListOpen"  append-to-body>
      <operation-list
        :treatRecordData="treatRecordData"
      />
    </el-dialog>

  </div>
</template>

<script>
import {getTreatRecordFullStat} from "@/api/health/treat/treatRecord";
import {formatDays} from "@/utils/datetime";
import FeeDetail from './fullStatFeeDetail'
import DrugList from "../treatDrug/index";
import OperationList from "../treatOperation/index";

export default {
  name: "TreatRecordFullStat",
  components: {
    'drug-list':DrugList,
    'operation-list':OperationList,
    'fee-detail':FeeDetail
  },
  data() {
    return {
      //药品列表
      drugListTitle:'',
      drugListOpen:false,
      treatRecordData:{
        id:undefined
      },
      //手术列表
      operationListTitle:'',
      operationListOpen:false,
      //费用详情
      feeDetailOpen:false,
      feeDetailTitle:'',
      fullStatData:{},
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 列表数据
      dataList:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined
      },
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 计算总天数 */
    formatTotalDays(row) {
      const max = new Date(Date.parse(row.maxTreatDate.replace(/-/g,"/")));
      const min = new Date(Date.parse(row.minTreatDate.replace(/-/g,"/")));
      let r = (parseInt(max - min)) / (1000*24*3600);
      return formatDays(r);
    },
    /** 计算距离现在 */
    formatTillNow(row) {
      const max = new Date();
      const min = new Date(Date.parse(row.maxTreatDate.replace(/-/g,"/")));
      let r = (parseInt(max - min)) / (1000*24*3600);
      return formatDays(r);
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      getTreatRecordFullStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.dataList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 药品列表 */
    handleDrugList(row){
      this.drugListTitle = '['+row.tags+']药品列表';
      this.drugListOpen =true;
      this.treatRecordData = Object.assign({}, this.treatRecordData, {
        tags: row.tags
      });
    },
    /** 手术列表 */
    handleOperationList(row){
      this.operationListTitle = '['+row.tags+']手术列表';
      this.operationListOpen =true;
      this.treatRecordData = Object.assign({}, this.treatRecordData, {
        tags: row.tags
      });
    },
    /** 费用详情操作 */
    handleFeeDetail(row){
      this.feeDetailOpen = true;
      this.feeDetailTitle = '['+row.tags+']费用详情';
      this.fullStatData = Object.assign({}, this.fullStatData, row);
    },
    /** 检验报告列表操作 */
    handleTreatTest(row){
      //路由定向
      this.$router.push({name:'TreatTest',query: {tags:row.tags}})
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    }
  }
};
</script>
