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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['food:dietCategory:query']">搜索</el-button>
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
          v-hasPermi="['food:dietCategory:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['food:dietCategory:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['food:dietCategory:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['food:dietCategory:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dietCategoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关键字" min-width="280px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.keywords }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类别名称" min-width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.className }}</span>
        </template>
      </el-table-column>
      <el-table-column label="大类" align="center" >
        <template slot-scope="{row}">
          <span>{{ row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" active-value="ENABLE" inactive-value="DISABLE" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['food:dietCategory:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['food:dietCategory:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="620px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
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
          <el-col :span="12">
            <el-form-item label="类别名称" prop="className">
              <el-input v-model="form.className" placeholder="请输入类别名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="大类" prop="type">
              <el-select v-model="form.type" :style="{width: '100%'}" placeholder="请选择">
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
            <el-form-item label="显示顺序" prop="orderIndex">
              <el-input-number v-model="form.orderIndex" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" :style="{width: '100%'}" prop="status">
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
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" :style="{width: '100%'}" type="textarea" placeholder="请输入内容"></el-input>
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
  import {fetchList,getDietCategory,createDietCategory,updateDietCategory,deleteDietCategory} from "@/api/food/dietCategory";
  import {appendTagToOptions} from "@/utils/tagUtils";

export default {
  name: "DietCategory",
  data() {
    return {
	  //查询条件更多属性 start
	  cdnTitle:'更多',
	  moreCdn:false,
	  //查询条件更多属性 end
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
      dietCategoryList:[],
      typeOptions:[],
      commonStatusOptions:this.commonStatusOptions,
      //标签属性 start
      keywordsTags: [],
      //已经保存过的商品标签
      hisKeywordsTags:[],
      inputVisible: false,
      inputValue: '',
      //标签属性 end
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        keywords: [
          { required: true, message: "关键字不能为空", trigger: "blur" }
        ],
        className: [
          { required: true, message: "类别名称不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "大类不能为空", trigger: "blur" }
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
    this.getDictItemTree('DIET_CATEGORY_TYPE',false).then(response => {
      this.typeOptions = response;
    });
  },
  methods: {
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
    /** 添加标签，避免重复 */
    appendTagToOptions(tag,options){
      const a = options.indexOf(tag);
      if(a>=0){
        this.msgError('该标签已经存在')
      }else{
        options.push(tag);
      }
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.dietCategoryList = response.rows;
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
        orderIndex: 0,
        status: "ENABLE"
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
      this.keywordsTags = [];
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getDietCategory(id).then(response => {
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
            updateDietCategory(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createDietCategory(this.form).then(response => {
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
          return deleteDietCategory(ids);
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
          return exportDietCategory(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
