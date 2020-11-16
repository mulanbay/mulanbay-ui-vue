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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['system:qaConfig:query']">搜索</el-button>
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
          v-hasPermi="['system:qaConfig:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:qaConfig:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:qaConfig:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:qaConfig:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-refresh"
          size="mini"
          @click="handleReloadCache"
          v-hasPermi="['system:qaConfig:reloadCache']"
        >刷新缓存</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-user"
          size="mini"
          @click="handleTreeView"
          v-hasPermi="['system:qaConfig:treeView']"
        >拓扑结构</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-user"
          size="mini"
          @click="handleCustomService"
          v-hasPermi="['system:qaConfig:textReq']"
        >智能客服</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="qaConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="160px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="返回类型" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.resultTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="代码" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.handleCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="显示顺序" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关键字" min-width="200" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.keywords }}</span>
        </template>
      </el-table-column>
      <el-table-column label="跳转QA" align="center">
        <template slot-scope="{row}">
          <span>{{ row.referQaId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上级QA" align="center">
        <template slot-scope="{row}">
          <span>{{ row.parentId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="缓存" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.matchCache"  disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" active-value="ENABLE" inactive-value="DISABLE" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
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
            v-hasPermi="['system:qaConfig:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:qaConfig:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="640px" append-to-body customClass="customDialogCss">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级QA" prop="parentId">
             <treeselect
              v-model="form.parentId"
              style="width: 480px"
              :options="qaListOptions"
              :disable-branch-nodes="false"
              :show-count="true"
              :searchable="true"
              placeholder="请选择上一级" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="QA名称" prop="name">
              <el-input v-model="form.name" style="width: 480px" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="返回类型" prop="resultType">
              <el-select v-model="form.resultType" placeholder="请选择">
                <el-option
                  v-for="dict in resultTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="匹配缓存" prop="matchCache">
              <el-switch
                v-model="form.matchCache">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="关键字" prop="keywords">
              <el-tag
                :key="tag"
                v-for="tag in keywordsTags"
                closable
                :disable-transitions="false"
                @close="handleTagClose(tag)">
                {{tag}}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleTagInputConfirm"
                @blur="handleTagInputConfirm"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showTagInput">+ 新建</el-button>
              <el-popover
                  placement="bottom"
                  title="请选择"
                  width="500"
                  trigger="click">
                  <el-tag
                    effect="plain"
                    :key="tag"
                    v-for="tag in hisKeywordsTags"
                    :disable-transitions="false"
                    @click="handleTagAppend(tag)">
                    {{tag}}
                  </el-tag>
                  <el-button slot="reference" type="success" size="mini" round>选择</el-button>
              </el-popover>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="跳转QA" prop="referQaId">
             <treeselect
              v-model="form.referQaId"
              style="width: 480px"
              :options="qaListOptions"
              :disable-branch-nodes="false"
              :show-count="true"
              :searchable="true"
              placeholder="请选择跳转QA" />
              <span class="link-type" @click="msgAlert('提示','返回类型为跳转回复时必填')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="内容/SQL">
              <el-input v-model="form.replayContent" style="width: 480px" :rows="5"  type="textarea" placeholder="请输入内容"></el-input>
              <span class="link-type" @click="msgAlert('提示','除返回类型为跳转回复时必填')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="回复标题" prop="replayTitle">
              <el-input v-model="form.replayTitle" style="width: 480px" placeholder="请输入标题" />
              <span class="link-type" @click="msgAlert('提示','返回类型为数据库查询时必填')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="列的模板" prop="columnTemplate">
              <el-input v-model="form.columnTemplate" style="width: 480px" placeholder="请输入" />
              <span class="link-type" @click="msgAlert('提示','返回类型为数据库查询时必填')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="处理代码" prop="handleCode">
              <el-input v-model="form.handleCode" style="width: 480px" placeholder="请输入" />
              <span class="link-type" @click="msgAlert('提示','如果不是数据库查询时而是由处理类处理时需要填写')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
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
          <el-col :span="12">
            <el-form-item label="排序号" prop="orderIndex">
              <el-input-number v-model="form.orderIndex" style="width: 190px"  controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark"  style="width: 480px" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 拓扑结构 -->
    <el-dialog :title="treeViewTitle" width="850px" :visible.sync="treeViewOpen"  append-to-body>
      <tree-view />
    </el-dialog>

    <!-- 智能客服 -->
    <el-dialog :title="csTitle" width="700px" :visible.sync="csOpen"  append-to-body>
      <custom-service />
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,reloadCache,getQaConfigTree,getQaConfig,createQaConfig,updateQaConfig,deleteQaConfig} from "@/api/system/qaConfig";
import {appendTagToOptions} from "@/utils/tagUtils";

import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import TreeView from './treeView'
import CustomService from '../cs/customService'

export default {
  name: "QaConfig",
  components: {
    Treeselect,
    'tree-view':TreeView,
    'custom-service':CustomService
  },
  data() {
    return {
      //智能客服
      csTitle:'',
      csOpen:false,
      //拓扑结构
      treeViewTitle:'',
      treeViewOpen:false,
      //标签属性 start
      keywordsTags: [],
      //已经保存过的商品标签
      hisKeywordsTags:[],
      inputVisible: false,
      inputValue: '',
      //标签属性 end
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
      qaConfigList:[],
      qaListOptions:[],
      resultTypeOptions:[],
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
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        orderIndex: [
          { required: true, message: "排序号不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        resultType: [
          { required: true, message: "返回类型不能为空", trigger: "blur" }
        ],
        matchCache: [
          { required: true, message: "匹配缓存不能为空", trigger: "blur" }
        ],
        handleCode: [
          { required: true, message: "处理代码不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getEnumTree('QaResultType','FIELD',false).then(response => {
      this.resultTypeOptions = response;
    });
  },
  methods: {
    initOptions(){
      this.getQaListTreeselect();
      this.getQaConfigKeywordsTreeselect();
    },
    /** QA列表下拉 */
    getQaListTreeselect(){
      getQaConfigTree(false).then(
        response => {
          this.qaListOptions = response;
        }
      );
    },
    /** 查询历史的关键字下拉树结构 */
    getQaConfigKeywordsTreeselect() {
      //后期从用户的客服记录中获取
      this.hisKeywordsTags=['默认'];
    },
    /** 标签处理 start */
    handleTagClose(tag){
      this.keywordsTags.splice(this.keywordsTags.indexOf(tag), 1);
    },
    handleTagAppend(tag) {
      appendTagToOptions(tag,this.keywordsTags);
    },
    showTagInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleTagInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        appendTagToOptions(inputValue,this.keywordsTags);
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    /** 标签处理 end */
    /** 刷新缓存 */
    handleReloadCache(){
      reloadCache().then(response => {
        this.msgSuccess('刷新成功');
      });
    },
    /** 拓扑结构 */
    handleTreeView(){
      this.treeViewTitle='QA拓扑结构';
      this.treeViewOpen=true;
    },
    /** 智能客服 */
    handleCustomService(){
      this.csTitle='智能客服';
      this.csOpen=true;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.qaConfigList = response.rows;
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
        name: undefined,
        resultType: 'DIRECT',
        orderIndex: 0,
        status:'ENABLE',
        matchCache:true
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
      this.initOptions();
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.initOptions();
      const id = row.id || this.ids.join(",")
      getQaConfig(id).then(response => {
        this.form = response;
        if(!this.isObjectEmpty(response.keywords)){
          this.keywordsTags = response.keywords.split(',');
        }else{
          this.keywordsTags = [];
        }
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      if(this.keywordsTags.length>0){
        this.form.keywords = this.keywordsTags.join(',');
      }else{
        this.form.keywords = undefined;
      }
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateQaConfig(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createQaConfig(this.form).then(response => {
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
          return deleteQaConfig(ids);
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
          return exportQaConfig(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
