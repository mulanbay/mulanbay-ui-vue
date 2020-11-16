<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="父级" prop="fid">
        <el-input
          v-model="queryParams.fid"
          disabled
          size="small"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input
          v-model="queryParams.type"
          disabled
          size="small"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['report:statValueConfig:query']">搜索</el-button>
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
          v-hasPermi="['report:statValueConfig:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:statValueConfig:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:statValueConfig:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['report:statValueConfig:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="statValueConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.valueClass }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="级联类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.casCadeTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['report:statValueConfig:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['report:statValueConfig:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="730px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="配置名称" prop="name">
              <el-input v-model="form.name" style="width: 580px"  placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="数据来源" prop="source">
              <el-radio-group v-model="form.source" @change="handleChangeSource">
                <el-radio label="SQL">数据库</el-radio>
                <el-radio label="ENUM">枚举类型</el-radio>
                <el-radio label="DATA_DICT">数据字典</el-radio>
                <el-radio label="JSON">Json数据</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item v-if="form.source == 'SQL'" label="查询语句" prop="sqlContent">
              <el-input v-model="form.sqlContent" type="textarea" :rows="5"  style="width: 580px"  placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.source == 'ENUM'" label="枚举类" prop="enumClass">
              <el-select
                v-model="form.enumClass"
                placeholder="枚举类"
                clearable
                collapse-tags
                style="width: 230px"
                size="small"
              >
                <el-option
                  v-for="dict in enumClassOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.source == 'ENUM'" label="枚举字段" prop="enumIdType">
              <el-select
                v-model="form.enumIdType"
                placeholder="枚举字段"
                clearable
                collapse-tags
                style="width: 230px"
                size="small"
              >
                <el-option
                  v-for="dict in enumIdTypeOptions"
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
            <el-form-item v-if="form.source == 'DATA_DICT'" label="数据字典" prop="dictGroupCode">
              <el-select
                v-model="form.dictGroupCode"
                placeholder="数据字典"
                clearable
                collapse-tags
                style="width: 230px"
                size="small"
              >
                <el-option
                  v-for="dict in dictGroupCodeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item v-if="form.source == 'JSON'" label="JSON数据" prop="jsonData">
              <el-input v-model="form.jsonData" type="textarea" :rows="5"  style="width: 580px"  placeholder="请输入内容"></el-input>
              <span class="link-type" @click="msgAlert('提示','数据格式：[{id:xx,text:xx}],为数组格式')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="值类型" prop="valueClass">
              <el-select v-model="form.valueClass" style="width: 230px" placeholder="请选择">
                <el-option
                  v-for="dict in valueClassOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="orderIndex">
              <el-input-number v-model="form.orderIndex" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="级联类型" prop="casCadeType">
              <el-select v-model="form.casCadeType" style="width: 230px" placeholder="请选择">
                <el-option
                  v-for="dict in casCadeTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户字段" prop="userField">
              <el-input v-model="form.userField" style="width: 230px" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="提示信息" prop="promptMsg">
              <el-input v-model="form.promptMsg" style="width: 580px"  placeholder="" />
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
  import {fetchList,getStatValueConfig,createStatValueConfig,updateStatValueConfig,deleteStatValueConfig} from "@/api/report/statValueConfig";
  import {getEnumClassNamesTree} from "@/api/common";
  import {getDictGroupTree} from "@/api/config/dictGroup";

export default {
  name: "StatValueConfig",
  props: {
    //父层带过来的账户信息值
    parentData:{
      fid:undefined,
      type:undefined
    }
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
      // 列表数据
      statValueConfigList:[],
      valueClassOptions:[],
      casCadeTypeOptions:[],
      enumClassOptions:[],
      enumIdTypeOptions:[],
      dictGroupCodeOptions:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      commonStatusOptions:this.commonStatusOptions,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        fid: undefined,
        type: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        valueClass: [
          { required: true, message: "值类型不能为空", trigger: "blur" }
        ],
        orderIndex: [
          { required: true, message: "排序号不能为空", trigger: "blur" }
        ],
        sqlContent: [
          { required: true, message: "SQL语句不能为空", trigger: "blur" }
        ],
        casCadeType: [
          { required: true, message: "级联类型不能为空", trigger: "blur" }
        ],
        promptMsg: [
          { required: true, message: "提示信息不能为空", trigger: "blur" }
        ],
        source:[
          { required: true, message: "数据来源不能为空", trigger: "blur" }
        ],
        enumClass:[
          { required: true, message: "枚举类型不能为空", trigger: "blur" }
        ],
        enumIdType:[
          { required: true, message: "枚举类字段类型不能为空", trigger: "blur" }
        ],
        dictGroupCode:[
          { required: true, message: "数据字典不能为空", trigger: "blur" }
        ],
        jsonData:[
          { required: true, message: "JSON数据不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.parentData);
    this.initOptions();
  },
  watch: {
    parentData: {
      deep: true,
      handler(val) {
        this.parentData =val;
        this.handleReceiveData(this.parentData);
      }
    }
  },
  methods: {
    /** 加载下来数据 */
    initOptions(){
      this.getEnumTree('StatValueClass','FIELD',false).then(response => {
        this.valueClassOptions = response;
      });
      this.getEnumTree('CasCadeType','FIELD',false).then(response => {
        this.casCadeTypeOptions = response;
      });
      getEnumClassNamesTree(false).then(response => {
        this.enumClassOptions = response;
      });
      this.getEnumTree('EnumIdType','FIELD',false).then(response => {
        this.enumIdTypeOptions = response;
      });
      getDictGroupTree('code',false).then(response => {
        this.dictGroupCodeOptions = response;
      });
    },
    /** 数据来源改变 */
    handleChangeSource(newVal){
      if(newVal=='DATA_DICT'){
        this.form.valueClass='STRING';
      }else if(newVal=='ENUM'){
        this.form.enumIdType='ORDINAL';
      }
    },
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.fid=data.fid;
      this.queryParams.type=data.type;
      this.getList();
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.statValueConfigList = response.rows;
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
        valueClass: 'LONG',
        orderIndex:1,
        casCadeType:'NOT_CASCADE',
        source:'SQL'
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
      if(this.isObjectEmpty(this.queryParams.fid)){
        this.msgError('没有父类信息，无法新增');
        return;
      }
      this.reset();
      this.form.fid = this.queryParams.fid;
      this.form.type = this.queryParams.type;
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getStatValueConfig(id).then(response => {
        this.form = response;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateStatValueConfig(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createStatValueConfig(this.form).then(response => {
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
          return deleteStatValueConfig(ids);
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
          return exportStatValueConfig(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
