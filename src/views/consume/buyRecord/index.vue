<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item v-if="familyMode=='F'" label="所属用户" prop="userId">
        <el-select
          v-model="queryParams.userId"
          placeholder="所属用户"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in familyUserList"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="名称检索" prop="roleName">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="商品类型" prop="goodsType">
        <el-select
          v-model="queryParams.goodsType"
          placeholder="商品类型"
          clearable
          size="small"
          style="width: 240px"
          @change="getQuerySubGoodsTypeTreeselect"
        >
          <el-option
            v-for="dict in goodsTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="商品子类" prop="subGoodsType">
        <el-select
          v-model="queryParams.subGoodsType"
          placeholder="商品子类"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in querySubGoodsTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="购买来源" prop="buyType">
        <el-select
          v-model="queryParams.buyType"
          placeholder="购买来源"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in buyTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true"  label="排序方式" prop="sortField">
        <el-select
          v-model="queryParams.sortField"
          placeholder="字段"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in querySortFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.sortType"
          placeholder="方式"
          clearable
          size="small"
          style="width: 115px"
        >
          <el-option
            v-for="dict in querySortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="是否二手" prop="secondhand">
        <el-select
          v-model="queryParams.secondhand"
          placeholder="二手类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in querySecondhandOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="购买日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          unlink-panels
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['consume:buyRecord:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['consume:buyRecord:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          :disabled="single"
          @click="handleCreateAsTemplate"
          v-hasPermi="['consume:buyRecord:create']"
        >以此为模板</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['consume:buyRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['consume:buyRecord:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['consume:buyRecord:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-document"
          size="mini"
          :disabled="single"
          @click="handleLifeArchives"
          v-hasPermi="['life:lifeArchives:create']"
        >同步档案</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-date"
          size="mini"
          :disabled="single"
          @click="handleCalendar"
          v-hasPermi="['data:userCalendar:create']"
        >寿命日历</el-button>
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
    <el-table v-loading="loading" :data="buyRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" width="400" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span v-if="row.keywords != null">
           ★
          </span>
          <span class="link-type" @click="handleUpdate(row)">{{ row.goodsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="购买来源" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ isObjectEmpty(row.buyType) ? '--':row.buyType.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品类型" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ isObjectEmpty(row.goodsType) ? '--':row.goodsType.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品子类" align="center" min-width="95" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ isObjectEmpty(row.subGoodsType) ? '--':row.subGoodsType.name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="总价" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.totalPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="购买日期" align="center" width="190">
        <template slot-scope="{row}">
          <span>{{ row.buyDate }}</span>
          <span class="link-type" @click="handleCompare(row)"><i class="el-icon-info" /></span>
        </template>
      </el-table-column>
      <el-table-column label="所属用户" v-if="familyMode=='F'" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ familyUserName(row.userId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺名称" align="center" width="90" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.shopName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.paymentName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运费" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.shipment) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="价格" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.price) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费日期" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.consumeDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="二手" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.secondhand" disabled ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['consume:buyRecord:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['consume:buyRecord:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="620px" append-to-body customClass="customDialogCss">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="商品名称" prop="goodsName">
              <el-input v-model="form.goodsName" placeholder="请输入商品名称" @blur="aiMatch"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="SKU信息" prop="skuInfo">
              <el-input v-model="form.skuInfo" placeholder="请输入SKU信息" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品类型" prop="goodsTypeId">
              <!--普通的el-option会导致显示问题-->
              <treeselect v-model="form.goodsTypeId" :options="goodsTypeOptions"  @input="getFormSubGoodsTypeTreeselect" :disable-branch-nodes="false" :show-count="true" placeholder="请选择商品类型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品子类" prop="subGoodsTypeId">
              <treeselect v-model="form.subGoodsTypeId" :options="formSubGoodsTypeOptions" :disable-branch-nodes="false" :show-count="true" placeholder="请选择商品子类" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="购买来源" prop="buyTypeId">
              <treeselect v-model="form.buyTypeId" :options="buyTypeOptions" :disable-branch-nodes="false" :show-count="true" placeholder="请选择购买来源" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消费类型">
              <el-select
                v-model="form.consumeType"
                size="medium"
                placeholder="请选择">
                <el-option
                  v-for="dict in consumeTypeOptions"
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
            <el-form-item label="商品标签" prop="keywords">
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
            <el-form-item label="店铺名称" prop="shopName">
              <el-input v-model="form.shopName" placeholder="请输入店铺名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌名称" prop="brand">
              <el-input v-model="form.brand" placeholder="请输入品牌名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品单价" prop="price">
              <el-input-number v-model="form.price" placeholder="单位:元" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运费费用" prop="shipment">
              <el-input-number v-model="form.shipment" placeholder="单位:元" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品数量" prop="amount">
              <el-input-number v-model="form.amount" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付方式">
              <el-select v-model="form.payment" :style="{width: '100%'}" placeholder="请选择">
                <el-option
                  v-for="dict in paymentOptions"
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
            <el-form-item label="购买时间" prop="buyDate">
              <el-date-picker type="datetime" v-model="form.buyDate" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '100%'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消费时间" prop="consumeDate">
              <el-date-picker type="datetime" v-model="form.consumeDate" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '100%'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否二手" prop="secondhand">
              <el-switch
                v-model="form.secondhand">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出售信息" prop="showSold">
              <el-switch
                v-model="showSold">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="售出价格" prop="soldPrice" v-if="true==showSold">
              <el-input-number v-model="form.soldPrice" placeholder="单位:元" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="售出时间" prop="deleteDate" v-if="true==showSold">
              <el-date-picker type="datetime" v-model="form.deleteDate" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '100%'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="handleEditLog" v-if="this.form.id!=null" v-hasPermi="['log:operationLog:getEditLogData']">日志</el-button>
      </div>
    </el-dialog>

    <!-- 人生档案详情页面 -->
      <el-dialog :title="ladTitle" width="650px" :visible.sync="ladOpen"  append-to-body>
        <life-archives-detail :lifeArchivesData="lifeArchivesData" @closeMe="closeLad"/>
      </el-dialog>

    <!-- 商品寿命比对 -->
    <el-dialog :title="ltcTitle" width="500px" :visible.sync="ltcOpen">
      <lifetime-compare :buyRecordData="buyRecordData"/>
    </el-dialog>

    <!-- 商品寿命日历 -->
    <el-dialog :title="calendarTitle" width="700px" :visible.sync="calendarOpen">
      <lifetime-calendar :buyRecordData="buyRecordData" @closeMe="closeCalendar"/>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,aiMatch,changeBuyRecordStatus,getBuyRecord,createBuyRecord,updateBuyRecord,deleteBuyRecord,getBuyRecordKeywordsTree} from "@/api/consume/buyRecord";
  import {createBuyRecordMatchLog} from "@/api/consume/buyRecordMatchLog";
  import {getGoodsTypeTree} from "@/api/consume/goodsType";
  import {getBuyTypeTree} from "@/api/consume/buyType";
  import {appendTagToOptions} from "@/utils/tagUtils";
  import {dispatchCommonStat} from "@/utils/planUtils";
  import {getNowDateTimeString} from "@/utils/datetime";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import LifeArchivesDetail from '../../life/lifeArchives/detail'
  import { mapGetters } from 'vuex'
  import LifetimeCompare from '../goodsLifetimeCompare'
  import LifetimeCalendar from './lifetimeCalendar'

export default {
  name: "BuyRecord",
  components: {
    Treeselect,
    'life-archives-detail':LifeArchivesDetail,
    'lifetime-compare':LifetimeCompare,
    'lifetime-calendar':LifetimeCalendar
  },
  filters: {
    keywordsTagFilter:function(keywords){
      const ss = keywords.split(',');
      const first = ss[0];
      return first;
    }
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      // 更多设置
      moreSetting:false,
      //同步档案属性 start
      ladTitle:'',
      ladOpen:false,
      lifeArchivesData:{},
      //同步档案属性 end
      //寿命比对
      ltcTitle:'',
      ltcOpen:false,
      buyRecordData:{},
      //寿命日历
      calendarTitle:'',
      calendarOpen:false,
      //智能匹配
      aiMatchRes:undefined,
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
      // 列表记录
      buyRecordList:[],
      //商品类型(搜索和表单是同一个)
      goodsTypeOptions:[],
      //搜索条件的商品子类型
      querySubGoodsTypeOptions:[],
      //购买来源(搜索和表单是同一个)
      buyTypeOptions:[],
      //表单的商品子类型
      formSubGoodsTypeOptions:[],
      //消费类型
      consumeTypeOptions:[],
      paymentOptions:[],
      //排序字段
      querySortFieldOptions:[],
      querySortTypeOptions:[],
      //是否二手
      querySecondhandOptions:[],
      //标签属性 start
      keywordsTags: [],
      //已经保存过的商品标签
      hisKeywordsTags:[],
      inputVisible: false,
      inputValue: '',
      //标签属性 end
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 出售信息
      showSold:false,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      commonStatusOptions:this.commonStatusOptions,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        sortField: 'buyDate',
        sortType: 'desc',
        userId:undefined
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        goodsTypeId: [
          { required: true, message: "商品类型不能为空", trigger: "blur" }
        ],
        buyTypeId: [
          { required: true, message: "购买来源不能为空", trigger: "blur" }
        ],
        consumeType: [
          { required: true, message: "消费类型不能为空", trigger: "blur" }
        ],
        goodsName: [
          { required: true, message: "商品名称不能为空", trigger: "blur" }
        ],
        shopName: [
          { required: true, message: "店铺名称不能为空", trigger: "blur" }
        ],
        price: [
          { required: true, message: "商品单价不能为空", trigger: "blur" }
        ],
        buyDate: [
          { required: true, message: "购买时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  computed: {
    ...mapGetters([
      'userId',
      'familyMode',
      'familyUserList'
    ])
  },
  created() {
    this.getList();
    //加载查询条件和表单的
    this.getGoodsTypeTreeselect();
    this.getBuyTypeTreeselect();
    this.getEnumTree('GoodsConsumeType','FIELD',false).then(response => {
      this.consumeTypeOptions = response;
    });
    this.getEnumTree('Payment','FIELD',false).then(response => {
      this.paymentOptions = response;
    });
    this.getDictItemTree('SECONDHAND',false).then(response => {
      this.querySecondhandOptions = response;
    });
    this.getDictItemTree('BUY_RECORD_SORT_FIELD',false).then(response => {
      this.querySortFieldOptions = response;
    });
    this.getDictItemTree('SORT_TYPE',false).then(response => {
      this.querySortTypeOptions = response;
    });
    this.getBuyRecordKeywordsTreeselect();
  },
  methods: {
    /** 更多查询条件处理 */
    handleMoreCdn(){
      if(this.moreCdn==true){
        //this.resetForm("queryForm");
        this.moreCdn=false;
        this.cdnTitle='更多';
      }else{
        this.moreCdn=true;
        this.cdnTitle='取消';
      }
    },
    /** 同步档案 */
    handleLifeArchives(){
      const id = this.ids.join(",")
      getBuyRecord(id).then(response => {
        this.ladTitle='同步档案';
        this.ladOpen=true;
        this.lifeArchivesData={
          id:undefined,
          title:'消费信息',
          content:response.goodsName+',花费:'+response.totalPrice+'元',
          date:response.buyDate,
          bussType:'BUY_RECORD',
          relatedBeans:'BuyRecord',
          sourceId:response.id,
          remark:undefined
        };
      });
    },
    /** 寿命比对 */
    handleCompare(row){
      this.ltcTitle='['+row.goodsName+']寿命比对';
      this.ltcOpen=true;
      this.buyRecordData = Object.assign({}, this.buyRecordData, {
        id: row.id
      });
    },
    /** 寿命日历 */
    handleCalendar(){
      this.calendarTitle='加入该商品到用户日历';
      this.calendarOpen=true;
      const id = this.ids.join(",")
      this.buyRecordData = Object.assign({}, this.buyRecordData, {
        id: id
      });
    },
    closeCalendar(){
      this.calendarOpen=false;
    },
    /** 关闭同步档案 */
    closeLad(){
      this.ladOpen=false;
    },
    /** 修改记录 */
    handleEditLog(){
      let para={
        beanName:'BuyRecord',
        id:this.form.id
      };
      //路由定向
      this.$router.push({name:'OperationLog/logCompare',query: para});
      this.open=false;
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
    /** 计划统计 */
    planStat(){
      dispatchCommonStat('BuyRecord',this.$router);
    },
    /** 商品名称智能匹配 */
    aiMatch(){
      const goodsName = this.form.goodsName;
      //编辑状态、没填商品名、已经选择过商品类型都不再智能匹配
      if(this.form.id!=null||this.isObjectEmpty(goodsName)||this.form.goodsTypeId!=null){
        return;
      }
      aiMatch(goodsName).then(response => {
        this.aiMatchRes = response;
        if(response!=null){
          this.form.goodsTypeId = response.goodsTypeId+'';
          if(response.subGoodsTypeId!=null){
            this.form.subGoodsTypeId = response.subGoodsTypeId+'';
          }
          this.form.shopName = response.shopName;
          this.form.brand = response.brand;
        }
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.buyRecordList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 查询历史的商品标签下拉树结构 */
    getBuyRecordKeywordsTreeselect() {
      getBuyRecordKeywordsTree(null,false).then(response => {
        if(!this.isObjectEmpty(response)){
          for(var j =0;j<response.length;j++){
            this.hisKeywordsTags.push(response[j].id);
          }
        }
      });
    },
    /** 查询搜索条件中的商品大类下拉树结构 */
    getGoodsTypeTreeselect() {
      getGoodsTypeTree(0,'COMMON',false).then(response => {
        this.goodsTypeOptions = response;
      });
    },
    /** 查询搜索条件中的商品子类下拉树结构 */
    getQuerySubGoodsTypeTreeselect(pid) {
      if(pid===undefined||pid===null||pid===''){
        this.querySubGoodsTypeOptions = [];
        this.queryParams.subGoodsType = undefined;
      }else{
        getGoodsTypeTree(pid,'COMMON',false).then(response => {
          this.querySubGoodsTypeOptions = response;
        });
      }
    },
    /** 查询搜索条件中的购买来源下拉树结构 */
    getBuyTypeTreeselect() {
      getBuyTypeTree(0,false).then(response => {
        this.buyTypeOptions = response;
      });
    },
    /** 查询表单中的商品子类下拉树结构 */
    getFormSubGoodsTypeTreeselect(pid) {
      if(pid===undefined||pid===null||pid===''){
        this.formSubGoodsTypeOptions = [];
        this.form.subGoodsTypeId = undefined;
      }else{
        getGoodsTypeTree(pid,'COMMON',false).then(response => {
          this.formSubGoodsTypeOptions = response;
        });
      }
    },
    /** 查询表单中的购买来源下拉树结构 */
    getFormBuyTypeTreeselect() {
      getBuyTypeTree(0,false).then(response => {
        this.formBuyTypes = response;
      });
    },
    // 状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.name + '"吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return changeBuyRecordStatus(row.roleId, row.status);
        }).then(() => {
          this.msgSuccess(text + "成功");
        }).catch(function() {
          row.status = row.status === "ENABLE" ? "DISABLE" : "ENABLE";
        });
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
        goodsName: undefined,
        amount: 1,
        shipment:0,
        payment:'ALIPAY',
        status:'BUY',
        secondhand:false,
        statable : true,
        consumeType:'NORMAL',
        keywords:null,
        goodsTypeId:undefined,
        subGoodsTypeId:undefined,
        shopName:undefined,
        brand:undefined
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
      this.aiMatchRes = undefined;
      this.keywordsTags = [];
      this.open = true;
      this.title = "添加";
    },
    /** 以模板新增按钮操作 */
    handleCreateAsTemplate() {
      this.reset();
      const id = this.ids.join(",")
      getBuyRecord(id).then(response => {
        this.copyToForm(response);
        this.form.id=undefined;
        //this.form.skuInfo=undefined;
        //this.form.goodsName=undefined;
        this.form.buyDate=getNowDateTimeString();
        this.form.consumeDate=undefined;
        this.open = true;
        this.title = "新增";
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getBuyRecord(id).then(response => {
        this.copyToForm(response);
        this.open = true;
        this.title = "修改";
      });
    },
    /** 复制 */
    copyToForm(response){
      this.form = response;
      this.getFormSubGoodsTypeTreeselect(response.goodsType.id);
      //后端的一对多转换为主键值
      this.form.goodsTypeId = response.goodsType.id;
      this.form.goodsType = undefined;
      if(response.subGoodsType!==undefined){
        this.form.subGoodsTypeId = response.subGoodsType.id;
        this.form.subGoodsType = undefined;
      }
      this.form.buyTypeId = response.buyType.id;
      this.form.buyType = undefined;
      if(!this.isObjectEmpty(response.keywords)){
        this.keywordsTags = response.keywords.split(',');
      }else{
        this.keywordsTags = [];
      }
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if(this.keywordsTags.length>0){
            this.form.keywords = this.keywordsTags.join(',');
          }else{
            this.form.keywords = undefined;
          }
          if (this.form.id != undefined) {
            updateBuyRecord(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createBuyRecord(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              this.handleMatchLog(response.id);
            });
          }
        }
      });
    },
    /** 增加匹配日志 */
    handleMatchLog(buyRecordId){
      if(buyRecordId==null||this.aiMatchRes==null){
        return;
      }
      this.aiMatchRes.buyRecordId = buyRecordId;
      createBuyRecordMatchLog(this.aiMatchRes).then(response => {
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
          return deleteBuyRecord(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有数据项?', "警告", {
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
