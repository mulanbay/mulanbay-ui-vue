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
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['report:chart:userChart:query']">搜索</el-button>
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
          v-hasPermi="['report:chart:userChart:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:chart:userChart:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:chart:userChart:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['report:chart:userChart:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="userChartList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="200px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="100" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleStat(row)"><i class="el-icon-s-data" /></span>
        </template>
      </el-table-column>
      <el-table-column label="首页显示" align="center">
        <template slot-scope="{row}">
          <el-switch v-model="row.showInIndex" disabled ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" disabled active-value="ENABLE" inactive-value="DISABLE"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right"  width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['report:chart:userChart:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['report:chart:userChart:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="750px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="选取模板" prop="chartConfigId">
             <treeselect
              v-model="form.chartConfigId"
              @input="loadTemplate"
              style="width: 580px"
              :options="chartConfigOptions"
              :disable-branch-nodes="true"
              :show-count="true"
              :searchable="true"
              :disabled="ncoDisabled"
              placeholder="请选择上级分类"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <form-create v-model="fApi" :option="fcOption"  :rule="fcRule"></form-create>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" style="width: 580px"  placeholder="请输入标题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="显示顺序" prop="orderIndex">
              <el-input-number v-model="form.orderIndex" style="width: 160px" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in commonStatusOptions"
                  :key="dict.id"
                  :label="dict.id"
                >{{dict.text}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="首页展示" prop="showInIndex">
              <el-switch v-model="form.showInIndex" :disabled="siiDisabled"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark"  style="width: 580px"  type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getUserChart,createUserChart,updateUserChart,deleteUserChart} from "@/api/report/chart/userChart";
  import {getChartConfigForUserTree,getChartConfig} from "@/api/report/chart/chartConfig";
  import {getStatValueConfigs} from "@/api/report/statValueConfig";
  import {generateFcRules,getBindValues,setBindValues} from "@/utils/formCreateUtils";

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import formCreate, { maker } from '@form-create/element-ui'

export default {
  name: "UserChart",
  components: {
    Treeselect,
    formCreate:formCreate.$form()
  },
  data() {
    return {
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
      // 总条数
      userChartList:[],
      chartConfigOptions:[],
      ncoDisabled:false,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      commonStatusOptions:this.commonStatusOptions,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // formCreate属性start
      fcRule:[],
      fcOption:{
        submitBtn:false,
        form:{
          labelWidth:'90px',
          size:undefined,
          inline:true,
          hideRequiredAsterisk:false
        }
      },
      //表单对象
      fApi:{},
      // formCreate属性end
      siiDisabled:true,
      rules: {
        chartConfigId: [
          { required: true, message: "模板不能为空", trigger: "blur" }
        ],
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        orderIndex: [
          { required: true, message: "排序号不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getChartConfigOptionsTreeselect();
    //this.fApi.rule=[];
  },
  methods: {
    /** 统计 */
    handleStat(row){
      //跳转
    },
    /** 查询搜索条件中的模板下拉树结构 */
    getChartConfigOptionsTreeselect() {
      getChartConfigForUserTree(false).then(response => {
        this.chartConfigOptions = response;
      });
    },
    loadTemplate(newVal){
      /** 从模板加载 */
      if(this.isObjectEmpty(newVal)||this.form.id!=null){
        return;
      }
      //加载下来菜单配置项
      this.loadStatValueConfigs(newVal,'CHART',null);
      //从模板拷贝基础信息
      getChartConfig(newVal).then(response => {
        this.form.title= response.title;
        this.setShowIndexEditStatus(response);
      });
    },
    //设置图表能否在首页显示的状态
    setShowIndexEditStatus(chartConfig){
      if(chartConfig.chartType=='PIE'||chartConfig.chartType=='BAR'){
        //只有这两种图表才可以在首页最下面一行显示
        this.siiDisabled=false;
      }else{
        this.siiDisabled=true;
      }
    },
    /** 获取值配置列表列表 */
    loadStatValueConfigs(fid,type,bindValues){
      getStatValueConfigs(fid,type).then(
        response => {
          const newRule = generateFcRules(response);
          //需要重载规则，否则编辑时无法设定值
          this.fApi.reload(newRule);
          setBindValues(bindValues,this.fApi);
        }
      );
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.userChartList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        status:'ENABLE',
        remind:false,
        orderIndex :1,
        showInIndex:true,
        title:undefined,
        calendarTitle:undefined,
        showInIndex:false
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
      this.ncoDisabled=false;
      this.fcRule=[];
      //this.fApi.reload([]);
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.ncoDisabled=true;
      const id = row.id || this.ids.join(",")
      getUserChart(id).then(response => {
        this.form = response;
        this.form.chartConfigId= response.chartConfig.id;
        this.setShowIndexEditStatus(response.chartConfig);
        //加载下来菜单配置项
        this.loadStatValueConfigs(this.form.chartConfigId,'CHART',this.form.bindValues);
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          //获取绑定值
          const bindValues = getBindValues(this.fApi);
          this.form.bindValues = bindValues;
          if (this.form.id != undefined) {
            updateUserChart(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createUserChart(this.form).then(response => {
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
          return deleteUserChart(ids);
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
          return exportUserChart(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
