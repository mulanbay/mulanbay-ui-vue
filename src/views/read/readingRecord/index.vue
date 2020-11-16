<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="图书分类" prop="bookCategoryId">
        <el-select
          v-model="queryParams.bookCategoryId"
          placeholder="图书分类"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in bookCategoryOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="阅读状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          size="small"
          style="width: 240px"
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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['read:readingRecord:query']">搜索</el-button>
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
          v-hasPermi="['read:readingRecord:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['read:readingRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['read:readingRecord:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['read:bookCategory:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="planStat"
          v-hasPermi="['report:plan:userPlan:commonStat']"
        >计划统计</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="readingRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left"  prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图书分类" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.bookCategory.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="书籍名称" fixed="left"  min-width="280px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.bookName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者" min-width="100px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="阅读明细" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetailList(row)"><i class="el-icon-s-grid" /></span>
          <span class="link-type" @click="handleCostTimes(row)"><i class="el-icon-s-data" /></span>
        </template>
      </el-table-column>
      <el-table-column label="借入/购买日期" align="center" width="120">
        <template slot-scope="{row}">
          <span v-if="row.storeDate ==null">
           <span>--</span>
          </span>
          <span v-else-if="calcuDays(row.storeDate)<=30">
           <span style="color:red">{{ row.storeDate }}</span>
          </span>
          <span v-else>
           <span>{{ row.storeDate }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="期望完成日期" align="center" width="120">
        <template slot-scope="{row}">
          <span v-if="row.proposedDate ==null">
           <span>--</span>
          </span>
          <span v-else-if="(0-calcuDays(row.proposedDate))<=30">
           <span style="color:red">{{ row.proposedDate }}</span>
          </span>
          <span v-else>
           <span>{{ row.proposedDate }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="国家" align="center">
        <template slot-scope="{row}">
          <span>{{ row.nation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" >
        <template slot-scope="{row}">
          <span v-if="row.status =='READED'">
           <span style="color:green">{{ row.statusName }}</span>
          </span>
          <span v-else-if="row.status =='UNREAD'">
           <span style="color:red">{{ row.statusName }}</span>
          </span>
          <span v-else-if="row.status =='READING'">
           <span style="color:purple">{{ row.statusName }}</span>
          </span>
          <span v-else>
           <span>{{ row.statusName }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="评分" align="center" >
        <template slot-scope="{row}">
          <span v-if="row.score >=7">
           <span style="color:red">{{ row.score }}</span>
          </span>
          <span v-else>
           <span>{{ row.score }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="语言" align="center">
        <template slot-scope="{row}">
          <span>{{ row.languageName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="书籍类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.bookTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始日期" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.beginDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成日期" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.finishedDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时长" align="center"min-width="120px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span v-if="row.costDays>=30">
           <span style="color:red">{{ formateCostDays(row.costDays) }}</span>
          </span>
          <span v-else>
           <span>{{ formateCostDays(row.costDays) }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="出版年份" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.publishedYear }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['read:readingRecord:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['read:readingRecord:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="720px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="书籍名称" prop="bookName">
             <el-input v-model="form.bookName" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="作者" prop="author">
             <el-input v-model="form.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="出版社" prop="press">
             <el-input v-model="form.press" placeholder="请输入出版社" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="ISBN" prop="isbn">
             <el-input v-model="form.isbn" placeholder="请输入isbn" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="国家" prop="nation">
             <el-input v-model="form.nation" placeholder="请输入国家" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="图书分类" prop="bookCategoryId">
              <el-select
                v-model="form.bookCategoryId"
                placeholder="图书分类"
                clearable
                size="medium"
                style="width: 220px"
              >
                <el-option
                  v-for="dict in bookCategoryOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="评分" prop="score">
              <el-rate
                v-model="form.score"
                show-score
                :max="5"
                allow-half
                text-color="#ff9900"
                score-template="{value}">
              </el-rate>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="语言" prop="language">
             <el-select
               v-model="form.language"
               placeholder="语言"
               clearable
               size="medium"
               style="width: 220px"
             >
               <el-option
                 v-for="dict in languageOptions"
                 :key="dict.id"
                 :label="dict.text"
                 :value="dict.id"
               />
             </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出版年份" prop="publishedYear">
              <el-input v-model="form.publishedYear" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="借入/购买日期" prop="storeDate">
              <el-date-picker type="date" v-model="form.storeDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '220px'}" placeholder="请选择日期" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="期望完成日期" prop="proposedDate">
              <el-date-picker type="date" v-model="form.proposedDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '220px'}" placeholder="请选择日期" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="开始日期" prop="beginDate">
              <el-date-picker type="date" v-model="form.beginDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '220px'}" placeholder="请选择日期" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成日期" prop="finishedDate">
              <el-date-picker type="date" v-model="form.finishedDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '220px'}" placeholder="请选择日期" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
             <el-select
               v-model="form.status"
               placeholder="状态"
               clearable
               size="medium"
               style="width: 220px"
             >
               <el-option
                 v-for="dict in statusOptions"
                 :key="dict.id"
                 :label="dict.text"
                 :value="dict.id"
               />
             </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="书籍类型" prop="bookType">
             <el-select
               v-model="form.bookType"
               placeholder="书籍类型"
               clearable
               size="medium"
               style="width: 220px"
             >
               <el-option
                 v-for="dict in bookTypeOptions"
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
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 明细列表页面 -->
    <el-dialog :title="detailListTitle" width="650px" :visible.sync="detailListVisible"  append-to-body>
      <reading-record-detail-list
        :readingRecordForDetailListData="readingRecordForDetailListData"
      />
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,getReadingRecordCostTimes,getReadingRecord,createReadingRecord,updateReadingRecord,deleteReadingRecord} from "@/api/read/readingRecord";
import {getBookCategoryTree} from "@/api/read/bookCategory";
import {getNowDateString,dateDiff,formatDays,formatSeconds} from "@/utils/datetime";
import ReadingRecordDetailList from '../readingRecordDetail/index'
import {dispatchCommonStat} from "@/utils/planUtils";

export default {
  name: "ReadingRecord",
  components: {
    'reading-record-detail-list':ReadingRecordDetailList
  },
  data() {
    return {
      //明细列表属性start
      detailListTitle:'',
      detailListVisible:false,
      readingRecordForDetailListData:{
        readingRecordId:undefined
      },
      //明细列表属性end
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
      readingRecordList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      statusOptions:[],
      bookCategoryOptions:[],
      languageOptions:[],
      bookTypeOptions:[],
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
        bookName: [
          { required: true, message: "书名不能为空", trigger: "blur" }
        ],
        author: [
          { required: true, message: "作者不能为空", trigger: "blur" }
        ],
        press: [
          { required: true, message: "出版社不能为空", trigger: "blur" }
        ],
        isbn: [
          { required: true, message: "ISBN不能为空", trigger: "blur" }
        ],
        nation: [
          { required: true, message: "国家不能为空", trigger: "blur" }
        ],
        bookCategoryId: [
          { required: true, message: "图书分类不能为空", trigger: "blur" }
        ],
        storeDate: [
          { required: true, message: "借入/购买日期不能为空", trigger: "blur" }
        ],
        proposedDate: [
          { required: true, message: "期望完成日期不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        bookType: [
          { required: true, message: "书籍类型不能为空", trigger: "blur" }
        ],
        publishedYear: [
          { required: true, message: "出版年份不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getEnumTree('ReadingStatus','FIELD',false).then(response => {
      this.statusOptions = response;
    });
    this.getEnumTree('BookLanguage','FIELD',false).then(response => {
      this.languageOptions = response;
    });
    this.getEnumTree('BookType','FIELD',false).then(response => {
      this.bookTypeOptions = response;
    });

    this.getBookCategoryTreeselect();
  },
  methods: {
    /** 计算时间 */
    calcuDays(date){
      return dateDiff(getNowDateString(),date);
    },
    /** 计划统计 */
    planStat(){
      dispatchCommonStat('ReadingRecord',this.$router);
    },
    /** 计算时间 */
    formateCostDays(date){
      return formatDays(date);
    },
    /** 图书分类列表 */
    getBookCategoryTreeselect() {
      getBookCategoryTree(false).then(response => {
        this.bookCategoryOptions = response;
      });
    },
    /** 明细列表 */
    handleDetailList(row){
      this.detailListTitle='['+row.bookName+']明细列表';
      this.detailListVisible=true;
      this.readingRecordForDetailListData = Object.assign({}, this.readingRecordForDetailListData, {
        readingRecordId: row.id
      });
    },
    /** 已经阅读时长 */
    handleCostTimes(row){
      getReadingRecordCostTimes(row.id).then(response => {
        if(response==0){
          this.msgAlert('提示','没有相关阅读记录');
        }else{
          let ss = formatSeconds(response*60);
          this.msgAlert('提示','总花费阅读时间：'+ss);
        }
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.readingRecordList = response.rows;
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
        status: 'UNREAD',
        language:'CHINESE',
        bookType:'PAPER',
        score:3
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
      getReadingRecord(id).then(response => {
        this.form = response;
        this.form.bookCategoryId = response.bookCategory.id+'';
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateReadingRecord(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createReadingRecord(this.form).then(response => {
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
          return deleteReadingRecord(ids);
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
          return exportReadingRecord(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
