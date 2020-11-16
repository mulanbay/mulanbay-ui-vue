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
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['consume:goodsLifetime:query']">搜索</el-button>
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
          v-hasPermi="['consume:goodsLifetime:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['consume:goodsLifetime:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['consume:goodsLifetime:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['consume:goodsLifetime:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="goodsLifetimeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="120px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关键字" align="center" min-width="150" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.keywords }}</span>
        </template>
      </el-table-column>
      <el-table-column label="有效时长" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ formatLifetimeDays(row.days) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['consume:goodsLifetime:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['consume:goodsLifetime:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="400px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="form.name" :style="{width: '100%'}" placeholder="请输入名称" />
        </el-form-item>
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
        <el-form-item label="有效天数" prop="days">
          <el-input-number v-model="form.days" :style="{width: '60%'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
          <el-select
            v-model="fc"
            placeholder="快速选择"
            size="small"
            style="width: 105px"
            @change="selectDays"
          >
            <el-option
              v-for="dict in daysOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,getGoodsLifetime,createGoodsLifetime,updateGoodsLifetime,deleteGoodsLifetime} from "@/api/consume/goodsLifetime";
import {appendTagToOptions} from "@/utils/tagUtils";
import {formatDays} from "@/utils/datetime";

export default {
  name: "GoodsLifetime",
  data() {
    return {
      //标签属性 start
      keywordsTags: [],
      //已经保存过的商品标签
      hisKeywordsTags:[],
      inputVisible: false,
      inputValue: '',
      //标签属性 end
      //时长快速选择
      fc:30,
      daysOptions:[
        {id:30,text:'一个月'},
        {id:90,text:'三个月'},
        {id:180,text:'半年'},
        {id:365,text:'一年'},
        {id:730,text:'两年'},
        {id:1095,text:'三年'},
        {id:1825,text:'五年'},
        {id:3650,text:'十年'}
      ],
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
      goodsLifetimeList:[],
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
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        keywords: [
          { required: true, message: "关键字不能为空", trigger: "blur" }
        ],
        days: [
          { required: true, message: "有效天数不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 时长显示处理 */
    formatLifetimeDays(days){
      return formatDays(days);
    },
    /** 时长快速选择 */
    selectDays(){
      this.form.days = this.fc;
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
    /** 查询历史的关键字下拉树结构 */
    getKeywordsTreeselect() {
      //后期从用户的客服记录中获取
      this.hisKeywordsTags=['默认'];
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.goodsLifetimeList = response.rows;
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
        days: 30
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
      this.getKeywordsTreeselect();
      this.keywordsTags=[];
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getKeywordsTreeselect();
      const id = row.id || this.ids.join(",");
      getGoodsLifetime(id).then(response => {
        this.form = response;
        this.keywordsTags = response.keywords.split(',');
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.form.keywords = this.keywordsTags.join(',');
      this.$refs["form"].validate(valid => {
        if (valid!=null) {
          if (this.form.id != undefined) {
            updateGoodsLifetime(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createGoodsLifetime(this.form).then(response => {
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
          return deleteGoodsLifetime(ids);
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
          return exportGoodsLifetime(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
