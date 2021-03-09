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
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="周期" prop="period">
        <el-select
          v-model="queryParams.period"
          placeholder="周期"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in periodOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['fund:budget:query']">搜索</el-button>
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
          v-hasPermi="['fund:budget:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['fund:budget:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['fund:budget:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['fund:budget:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleStat"
          v-hasPermi="['fund:budget:stat']"
        >统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleTimelineStat"
          v-hasPermi="['fund:budget:timelineStat']"
        >进度统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleBudgetLogStat"
          v-hasPermi="['fund:budgetLog:stat']"
        >执行统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleBudgetAnalyse"
          v-hasPermi="['fund:budget:analyse']"
        >预算分析</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleBudgetLogValueErrorStat"
          v-hasPermi="['fund:budgetLog:valueErrorStat']"
        >误差统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-menu"
          size="mini"
          @click="handleBudgetPeriodStat"
          v-hasPermi="['fund:budgetLog:periodStat']"
        >预算日志</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="budgetList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="180px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算金额" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新增流水" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleAddLog(row.id)" v-if="row.period=='ONCE'">
            <i class="el-icon-circle-plus"></i>
          </span>
          <span v-else-if="row.feeType!=null">自动</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="周期类型" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.periodName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期支付时间" :show-overflow-tooltip="true" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ formatCurrentPaidTime(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期支付金额" :show-overflow-tooltip="true" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ formatCurrentPaidAmount(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center" width="80">
        <template slot-scope="{row}">
          <span v-if="row.cpPaidAmount!=null">
            <el-progress :percentage="formatPercent(row)" :color="customColors"></el-progress>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签" align="center" width="95">
        <template slot-scope="{row}">
          <span v-if="row.keywords != null">
           <el-tag type="success">{{ row.keywords}}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="首次支付时间" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ row.firstPaidTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上一次支付时间" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ row.lastPaidTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置提醒" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.remind" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" active-value="ENABLE" inactive-value="DISABLE" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['fund:budget:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['fund:budget:delete']"
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

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="650px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="预算名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入预算名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="预算金额" prop="amount">
              <el-input-number
                v-model="form.amount"
                placeholder="单位:元"
                controls-position="right"
                :min="0" :controls="false" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预算类型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="类型"
                clearable
              >
                <el-option
                  v-for="dict in typeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="预算周期" prop="period">
              <el-select
                v-model="form.period"
                placeholder="周期"
                clearable
              >
                <el-option
                  v-for="dict in periodOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资金类型" prop="feeType">
              <el-select
                v-model="form.feeType"
                placeholder="类型"
                clearable
                @change="onFeeTypeChange"
              >
                <el-option
                  v-for="dict in feeTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="'BUY_RECORD'==this.form.feeType">
          <el-col :span="12">
            <el-form-item label="商品类型" prop="goodsTypeId">
              <!--普通的el-option会导致显示问题-->
              <treeselect
                v-model="form.goodsTypeId"
                :options="goodsTypeOptions"
                @input="getSubGoodsTypeTreeselect"
                :disable-branch-nodes="false"
                :show-count="true"
                size="small"
                placeholder="请选择商品类型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品子类" prop="subGoodsTypeId">
              <treeselect
                v-model="form.subGoodsTypeId"
                :options="subGoodsTypeOptions"
                :disable-branch-nodes="false"
                :show-count="true"
                placeholder="请选择商品子类" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="'BUY_RECORD'==this.form.feeType">
          <el-col :span="24">
            <el-form-item label="商品标签" prop="keywords">
              <el-input v-model="form.keywords" :style="{width: '510px'}"/>
              <span class="link-type" @click="msgAlert('提示','商品名称或商品标签中包含的关键字')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="预期时间" prop="expectPaidTime">
              <el-date-picker type="datetime" v-model="form.expectPaidTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '200px'}" placeholder="请选择时间" clearable >
              </el-date-picker>
              <span class="link-type" @click="msgAlert('提示','<1>对于单次类型，必须设置预期实现时间，则预算金额会加入到该日期所在月的月预算中。<br><2>对于每年类型，如果设置预期实现时间，则预算金额会加入到该日期所在月的每年的该月预算中')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否提醒" prop="remind">
              <el-switch
                v-model="form.remind">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="预算状态" prop="period">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in commonStatusOptions"
                  :key="dict.id"
                  :label="dict.id"
                >{{dict.text}}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 预算流水 -->
    <el-dialog title="新增预算流水" width="600px" :visible.sync="createBudgetLogVisible">
      <budget-log-detail :budgetData="budgetData" @closeMe="closeBudgetLogDetail"/>
    </el-dialog>

    <!-- 预算分析 -->
    <el-dialog title="预算分析" width="850px" :visible.sync="budgetAnalyseDetailVisible">
      <budget-anaylse-detail/>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,changeBudgetStatus,changeBudget,getBudget,createBudget,updateBudget,deleteBudget} from "@/api/fund/budget";
  import BudgetLogDetail from '../budgetLog/detail'
  import BudgetAnalyseDetail from './analyseDetail'
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import {getGoodsTypeTree} from "@/api/consume/goodsType";
  import {getPercent,progressColors} from "@/utils/mulanbay";
  import {getQueryObject} from "@/utils/index";

export default {
  name: "Budget",
  components: {
    Treeselect,
    'budget-log-detail':BudgetLogDetail,
    'budget-anaylse-detail':BudgetAnalyseDetail
  },
  data() {
    return {
      //新增预算流水
      createBudgetLogVisible:false,
      //预算分析
      budgetAnalyseDetailVisible:false,
      //新增预算流水主键值
      budgetData: {
        budgetId:''
      },
      // 遮罩
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
      budgetList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示修改账户弹出层
      openChange: false,
      // 类型
      typeOptions:[],
      // 状态
      statusOptions:this.commonStatusOptions,
      //周期
      periodOptions:[],
      //资金列表
      feeTypeOptions:[],
      //商品类型
      goodsTypeOptions:[],
      //商品子类
      subGoodsTypeOptions:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      },
      //进度百分比颜色
      customColors: progressColors,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        amount: [
          { required: true, message: "金额不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "类型不能为空", trigger: "blur" }
        ],
        period: [
          { required: true, message: "周期不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ]
      }
    };
  },
  mounted() {

  },
  created() {
    //处理查询参数
    let qb = getQueryObject(null);
    if(!this.isObjectEmpty(qb.feeType)){
      //商品类型页面过来
      this.queryParams.feeType = qb.feeType;;
      this.queryParams.goodsTypeId = qb.goodsTypeId;;
      this.queryParams.subGoodsTypeId = qb.subGoodsTypeId;;
    }
    //查询
    this.getList();
    this.getEnumTree('BudgetType','FIELD',false).then(response => {
      this.typeOptions = response;
    });
    //预算周期采用数据字典配置，有些周期类型不好实现
    this.getDictItemTree('BUDGET_PERIOD_TYPE',false).then(response => {
      this.periodOptions = response;
    });
    this.getEnumTree('BudgetFeeType','FIELD',false).then(response => {
      this.feeTypeOptions = response;
    });
    this.getGoodsTypeTreeselect();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.budgetList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 资金类型改变 */
    onFeeTypeChange(){
      if('BUY_RECORD'==this.form.feeType){
        this.getGoodsTypeTreeselect();
      }else{
        this.goodsTypeOptions = [];
        this.form.goodsTypeId = undefined;
        this.form.subGoodsTypeId = undefined;
      }
    },
    /** 查询商品大类下拉树结构 */
    getGoodsTypeTreeselect() {
      getGoodsTypeTree(0,'COMMON',false).then(response => {
        this.goodsTypeOptions = response;
      });
    },
    /** 查询商品子类下拉树结构 */
    getSubGoodsTypeTreeselect() {
      const pid = this.form.goodsTypeId;
      if(this.isObjectEmpty(pid)){
        this.subGoodsTypeOptions = [];
        this.form.subGoodsTypeId = undefined;
      }else{
        getGoodsTypeTree(pid,'COMMON',false).then(response => {
          this.subGoodsTypeOptions = response;
        });
      }
    },
    /** 本期支付时间 */
    formatCurrentPaidTime(row){
      if(row.cpPaidTime){
        return row.cpPaidTime.substr(5,5)+'(已支付)';
      }else{
        if(row.nextPaytime){
          let cpt = row.nextPaytime.substr(5,5);
          if(row.leftDays==0){
            return cpt+'(今天)';
          }else if(row.leftDays<0){
            var ld = 0-row.leftDays;
            return cpt+'(已过去'+ld+'天)';
          }else{
            var ld = row.leftDays;
            return cpt+'('+ld+'天后)';
          }
        }else{
          return '--';
        }
      }
    },
    /** 本期支付金额 */
    formatCurrentPaidAmount(row){
      if(row.cpPaidAmount){
        var ca = (row.cpPaidAmount-row.amount).toFixed(2);
        if(ca>0){
          return this.formatMoneyWithSymbal(row.cpPaidAmount)+'(+'+ca+')';
        }else if(ca<0){
          return this.formatMoneyWithSymbal(row.cpPaidAmount)+'(-'+(0-ca)+')';
        }else{
          return this.formatMoneyWithSymbal(row.cpPaidAmount);
        }
      }else{
        return '--';
      }
    },
    /** 进度 */
    formatPercent(row){
      let pp = getPercent(row.cpPaidAmount,row.amount);
      return parseInt(pp.toFixed(0));
    },
    //统计
    handleStat(){
      //路由定向
      this.$router.push({name:'BudgetStat',query: {}})
    },
    //时间线统计
    handleTimelineStat(){
      //路由定向
      this.$router.push({name:'BudgetTimelineStat',query: {}})
    },
    //预算执行统计
    handleBudgetLogStat(){
      //路由定向
      this.$router.push({name:'BudgetLogStat',query: {}})
    },
    //误差统计
    handleBudgetLogValueErrorStat(){
      //路由定向
      this.$router.push({name:'BudgetLogValueErrorStat',query: {}})
    },
    //预算日志
    handleBudgetPeriodStat(){
      //路由定向
      this.$router.push({name:'BudgetLogPeriodStat',query: {}})
    },
    //预算分析
    handleBudgetAnalyse(){
      this.budgetAnalyseDetailVisible=true;
    },
    //新增预算流水
    handleAddLog(id){
      this.createBudgetLogVisible = true;
      this.budgetData = Object.assign({}, this.budgetData, {
        budgetId: id
      });
    },
    //关闭子组件方法
    closeBudgetLogDetail(){
      this.createBudgetLogVisible = false;
    },
    // 状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.name + '"吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return changeBudgetStatus(row.id, row.status);
        }).then(() => {
          this.msgSuccess(text + "成功");
        }).catch(function() {
          row.status = row.status === "ENABLE" ? "DISABLE" : "ENABLE";
        }
      );
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮
    cancelChange() {
      this.openChange = false;
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        type: 'INSURANCE',
        period: "MONTHLY",
        status:'ENABLE',
        remind:false,
        feeType:undefined
      };
      this.resetForm("form");
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
    /** 新增按钮操作 */
    handleCreate() {
      this.reset();
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getBudget(id).then(response => {
        this.form = response;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      if(this.form.period=='ONCE'&&this.form.expectPaidTime==null){
        this.msgAlert("单次预算需要设置期望时间");
        return;
      }
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateBudget(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createBudget(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteBudget(ids);
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
          return exportAccount(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
