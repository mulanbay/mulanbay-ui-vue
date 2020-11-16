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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['report:chart:chartConfig:query']">搜索</el-button>
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
          v-hasPermi="['report:chart:chartConfig:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:chart:chartConfig:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:chart:chartConfig:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['report:chart:chartConfig:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="chartConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="300" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置项" width="100" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleStatValueList(row)"><i class="el-icon-s-grid" /></span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="等级" align="center">
        <template slot-scope="{row}">
          <span>{{ row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="95">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" active-value="ENABLE" inactive-value="DISABLE" disabled=""></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="关联业务" align="center" width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.relatedBeans }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图表类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.chartTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支持时间查询" align="center" width="120">
        <template slot-scope="{row}">
          <el-switch v-model="row.supportDate" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center"  width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['report:chart:chartConfig:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['report:chart:chartConfig:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="750px" append-to-body customClass="customDialogCss">
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="选取模板" prop="tmpChartConfigId">
             <treeselect
              v-model="form.tmpChartConfigId"
              @input="loadTemplate"
              style="width: 580px"
              :options="chartConfigOptions"
              :disable-branch-nodes="true"
              :show-count="true"
              :searchable="true"
              :disabled="ncoDisabled"
              placeholder="请选择上级分类" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" style="width: 580px"  placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" style="width: 580px"  placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="请求参数" prop="para">
              <el-input v-model="form.para" type="textarea" :rows="5"  style="width: 580px"  placeholder="请输入内容"></el-input>
              <span class="link-type" @click="handleParaDetail"><i class="el-icon-info" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="关联业务" prop="relatedBeans">
              <el-select v-model="form.relatedBeans" style="width: 230px" placeholder="请选择">
                <el-option
                  v-for="dict in relatedBeansOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in commonStatusOptions"
                  :key="dict.id"
                  :label="dict.id"
                >{{dict.text}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="orderIndex">
              <el-input-number v-model="form.orderIndex" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板等级" prop="level">
              <el-input-number v-model="form.level" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="API地址" prop="url">
              <el-input v-model="form.url" style="width: 580px"  placeholder="" />
              <span class="link-type" @click="msgAlert('提示','该图表所对应请求的API接口地址')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="详情地址" prop="detailUrl">
              <el-input v-model="form.detailUrl" style="width: 580px"  placeholder="" />
              <span class="link-type" @click="msgAlert('提示','该图表数据所关联的业务数据连接地址，目前是路由配置中的name')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="图表类型" prop="chartType">
              <el-select v-model="form.chartType" style="width: 230px" placeholder="请选择">
                <el-option
                  v-for="dict in chartTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间查询" prop="supportDate">
              <el-switch v-model="form.supportDate"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息" prop="remark">
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

    <!-- 统计值列表页面 -->
    <el-dialog :title="statValueConfigListTitle" width="850px" :visible.sync="statValueConfigListVisible"  append-to-body>
      <stat-value-list
        :parentData="chartConfigData"
      />
    </el-dialog>


    <!-- 参数详情 -->
    <el-dialog :title="paraDetailTitle" width="500px" :visible.sync="paraDetailVisible">
      <para-detail :keyValueListData="keyValueListData"/>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getChartConfigTree,getChartConfig,createChartConfig,updateChartConfig,deleteChartConfig} from "@/api/report/chart/chartConfig";
  import {getDomainClassNamesTree} from "@/api/auth/systemFunction";
  import {getBussTypeTree} from "@/api/common";
  import {encodeJsonString} from "@/utils/mulanbay";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import StatValueList from '../../statValueConfig/index'
  import ParaDetail from '../../../common/keyValueTable'

export default {
  name: "ChartConfig",
  components: {
    Treeselect,
    'stat-value-list':StatValueList,
    'para-detail':ParaDetail
  },
  data() {
    return {
      //参数详情值(子页面使用)
      paraDetailTitle:'',
      paraDetailVisible:false,
      keyValueListData: [],
      //统计值属性start
      statValueConfigListTitle:'',
      statValueConfigListVisible:false,
      chartConfigData:{
        fid:undefined,
        type:undefined
      },
      //统计值属性end
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
      chartConfigList:[],
      chartConfigOptions:[],
      ncoDisabled:false,
      relatedBeansOptions:[],
      chartTypeOptions:[],
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
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" }
        ],
        para: [
          { required: true, message: "请求参数不能为空", trigger: "blur" }
        ],
        relatedBeans: [
          { required: true, message: "关联的业务不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        level: [
          { required: true, message: "等级不能为空", trigger: "blur" }
        ],
        orderIndex: [
          { required: true, message: "排序号不能为空", trigger: "blur" }
        ],
        chartType: [
          { required: true, message: "图标类型不能为空", trigger: "blur" }
        ],
        bussKey: [
          { required: true, message: "业务KEY不能为空", trigger: "blur" }
        ],
        supportDate: [
          { required: true, message: "是否支持时间查询不能为空", trigger: "blur" }
        ],
        url: [
          { required: true, message: "API请求地址不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getEnumTree('ChartType','FIELD',false).then(response => {
      this.chartTypeOptions = response;
    });
    getBussTypeTree(false).then(response => {
      this.relatedBeansOptions = response;
    });
    this.getBussKeyTreeselect();
  },
  methods: {
    loadTemplate(newVal){
      /** 从模板加载 */
      if(this.isObjectEmpty(newVal)||this.form.id!=null){
        return;
      }
      getChartConfig(newVal).then(response => {
        response.id=undefined;
        this.form = response;
        //不重新设置会导致树形选择框不显示
        this.form.tmpChartConfigId=newVal;
      });
    },
    /** 查询搜索条件中的模板下拉树结构 */
    getChartConfigOptionsTreeselect() {
      getChartConfigTree(false).then(response => {
        this.chartConfigOptions = response;
      });
    },
    /** 查询业务key下拉树结构 */
    getBussKeyTreeselect() {
      getDomainClassNamesTree().then(response => {
        this.bussKeyOptions = response;
      });
    },
    /** 配置属性列表 */
    handleStatValueList(row){
      this.statValueConfigListTitle='['+row.name+']配置项列表';
      this.statValueConfigListVisible=true;
      this.chartConfigData = Object.assign({}, this.chartConfigData, {
        fid: row.id,
        type:'CHART'
      });
    },
    /** 参数详情 */
    handleParaDetail(){
      var brData  = new Array();
      const para= eval('(' + this.form.para + ')');
      for (let key of Object.keys(para)) {
        brData.push({key:key,value :para[key] });
      }
      this.keyValueListData =brData;
      this.paraDetailTitle='参数详情';
      this.paraDetailVisible=true;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.chartConfigList = response.rows;
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
        sqlType: 'SQL',
        resultType: 'DATE',
        valueType: 'DAY',
        status:'ENABLE',
        notifyType: 'MORE',
        level:3,
        rewardPoint:0,
        orderIndex :1
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
      this.getChartConfigOptionsTreeselect();
      this.ncoDisabled=false;
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.ncoDisabled=true;
      //this.getNotifyConfigOptionsTreeselect();
      const id = row.id || this.ids.join(",")
      getChartConfig(id).then(response => {
        this.form = response;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.para=encodeJsonString(this.form.para);
          if (this.form.id != undefined) {
            updateChartConfig(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createChartConfig(this.form).then(response => {
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
          return deleteChartConfig(ids);
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
          return exportChartConfig(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
