<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="预算" prop="budgetKey">
        <treeselect v-model="queryParams.budgetKey"
        :options="budgetOptions"
        :disable-branch-nodes="false"
        :show-count="true" placeholder="请选择预算"
        style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="创建日期">
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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['fund:budgetLog:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['fund:budgetLog:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['fund:budgetLog:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['fund:budgetLog:delete']"
        >删除</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="budgetLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" fixed="left">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="140px" fixed="left">
        <template slot-scope="{row}">
          <span>{{ formartName(row) }}</span>
          <span v-if="row.budget == null">
           <el-tag type="success" size="mini">{{ row.periodName }}</el-tag>
           <span class="link-type" @click="handlePeriodStat(row)"><i class="el-icon-info"></i></span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="业务日期" align="center" width="100" fixed="left">
        <template slot-scope="{row}">
          <span>{{ row.bussKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源" width="60px"  align="center">
        <template slot-scope="{row}">
          <span v-if=" 'MANUAL' == row.source">
           <el-tag size="mini">{{ row.sourceName }}</el-tag>
          </span>
          <span v-else-if=" 'AUTO' == row.source">
           <el-tag type="success" size="mini">{{ row.sourceName }}</el-tag>
          </span>
          <span v-else-if=" 'REAL_TIME' == row.source">
           <el-tag type="danger" size="mini">{{ row.sourceName }}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="预算金额" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.budgetAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际消费" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.ncAmount+row.bcAmount+row.trAmount) }}</span>
          <span v-if="(row.ncAmount+row.bcAmount+row.trAmount)>row.budgetAmount">
           <el-tag type="danger" size="mini">超支</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="消费详情" align="center">
      <el-table-column label="实际普通消费" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.ncAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际突发消费" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.bcAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际看病花费" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.trAmount) }}</span>
        </template>
      </el-table-column>
      </el-table-column>
      <el-table-column label="收入统计" align="center"  width="160">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.incomeAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账户变化" align="center"  width="160">
        <template slot-scope="{row}">
          <span v-if="row.accountChangeAmount == null&&row.budget == null">
           <span class="link-type" @click="handleAccountChange(row.bussKey)"><i class="el-icon-s-promotion"></i></span>
          </span>
          <span v-else>{{ formatMoney(row.accountChangeAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="重新统计" width="80"  align="center">
        <template slot-scope="{row}">
          <span v-if="row.budget == null">
           <span class="link-type" @click="handleReStat(row.id)">
             <i class="el-icon-s-promotion"></i>
           </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="预算快照" width="80"  align="center">
        <template slot-scope="{row}">
          <span v-if="row.budget == null">
           <span class="link-type" @click="handleBudgetSnapshot(row)">
             <i class="el-icon-s-grid"></i>
           </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="说明" align="center" width="160" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发生时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.occurDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后更新时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.lastModifyTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.budget != null"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['fund:budgetLog:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['fund:budgetLog:delete']"
          >删除</el-button>
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

    <!-- 预算流水 -->
    <el-dialog :title="title" width="600px" :visible.sync="budgetLogDetailVisible">
      <budget-log-detail :budgetData="budgetData" @closeMe="closeBudgetLogDetail" @refreshList="handleQuery"/>
    </el-dialog>

    <!-- 预算快照 -->
    <el-dialog :title="budgetSnapshotTitle" width="900px" :visible.sync="budgetSnapshotVisible">
      <el-table :data="budgetSnapshotList" >
        <el-table-column label="ID" prop="key" align="center">
          <template slot-scope="{row}">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="value" align="center">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预算金额" prop="value" align="center">
          <template slot-scope="{row}">
            <span>{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="value" align="center">
          <template slot-scope="{row}">
            <span>{{ row.typeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="周期类型" prop="value" align="center">
          <template slot-scope="{row}">
            <span>{{ row.periodName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付金额" prop="value" align="center">
          <template slot-scope="{row}">
            <span v-if="row.cpPaidAmount>row.amount" style="color: red;">
              {{ formatMoney(row.cpPaidAmount) }}
            </span>
            <span v-else>
              {{ formatMoney(row.cpPaidAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="支付时间" prop="value" align="center" width="110px" :show-overflow-tooltip="true">
          <template slot-scope="{row}">
            <span>{{ row.cpPaidTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="value" align="center" width="110px" :show-overflow-tooltip="true">
          <template slot-scope="{row}">
            <span>{{ row.createdTime }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getBudgetLog,createBudgetLog,updateBudgetLog,deleteBudgetLog,reSaveBudgetLog} from "@/api/fund/budgetLog";
  import {fetchList as fetchSnapshotList} from "@/api/fund/budgetSnapshot";
  import {updateBudgetLogAccountChange} from "@/api/fund/account";
  import {getBudgetTree} from "@/api/fund/budget";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import BudgetLogDetail from './detail'

export default {
  name: "BudgetLog",
  components: {
    Treeselect,
    'budget-log-detail':BudgetLogDetail
  },
  data() {
    return {
      //流水详情
      budgetLogDetailVisible:false,
      //预算流水主键值
      budgetData: {
        budgetId:'',
        id:undefined
      },
      //快照列表开启状态
      budgetSnapshotVisible:false,
      budgetSnapshotTitle:"",
      //快照列表
      budgetSnapshotList:[],
      title:'',
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
      budgetLogList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //预算列表
      budgetOptions:[],
      //状态
      commonStatusOptions:this.commonStatusOptions,
      //收入类型
      typeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "收入名称不能为空", trigger: "blur" }
        ],
        amount: [
          { required: true, message: "收入金额不能为空", trigger: "blur" }
        ],
        occurTime: [
          { required: true, message: "发生时间不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    //查询账户树
    this.getBudgetTreeselect();
  },
  methods: {
    /** 名称 */
    formartName(row){
      return this.isObjectEmpty(row.budget) ? '预算合计' : row.budget.name;
    },
    /** 查询预算下拉树结构 */
    getBudgetTreeselect() {
      getBudgetTree(false).then(response => {
        this.budgetOptions = response;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.budgetLogList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 预算快照 */
    handleBudgetSnapshot(row){
      this.budgetSnapshotTitle="["+this.formartName(row)+"]"+row.bussKey+"预算快照";
      this.budgetSnapshotVisible=true;
      const qp ={
        page :0,
        needTotal:false,
        budgetLogId:row.id
      }
      fetchSnapshotList(qp).then(
        response => {
          this.budgetSnapshotList = response.rows;
        }
      );
    },
    /** 详情 */
    handlePeriodStat(row){
      let date='';
      if(row.period=='MONTHLY'){
        date = row.occurDate.substring(0,7);
      }else{
        date = row.occurDate.substring(0,4);
      }
      //路由定向
      this.$router.push({name:'BudgetLogPeriodStat',query: {date:date}})
    },
    /** 账户变化统计 */
    handleAccountChange(bussKey){
      this.$confirm('是否要统计该条记录的账户变化值?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return updateBudgetLogAccountChange(bussKey);
        }).then(() => {
          this.getList();
          this.msgSuccess("统计成功");
        }).catch(function() {});
    },
    /** 重新统计 */
    handleReStat(id){
      this.$confirm('是否要重新统计该条记录?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return reSaveBudgetLog(id);
        }).then(() => {
          this.getList();
          this.msgSuccess("统计成功");
        }).catch(function() {});
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
    },
    closeBudgetLogDetail(){
      this.budgetLogDetailVisible = false;
    },
    /** 新增按钮操作 */
    handleCreate() {
      this.budgetLogDetailVisible = true;
      this.budgetData = Object.assign({}, this.budgetData, {
        id: undefined,
        budgetId:''
      });
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const id = row.id || this.ids.join(",")
      this.budgetLogDetailVisible = true;
      this.budgetData = Object.assign({}, this.budgetData, {
        id: id,
        budgetId:undefined
      });
      this.title = "修改";
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteBudgetLog(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有购买来源数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportRole(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
