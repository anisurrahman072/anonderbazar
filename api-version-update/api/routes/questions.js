exports.questionsRoute = {
  'GET /api/v1/questions/getAllQuestionedProducts': 'QuestionsController.getAllQuestionedProducts',
  'DELETE /api/v1/questions/deleteQuestion/:id': 'QuestionsController.destroy',
  'GET /api/v1/questions/read/:id': 'QuestionsController.findOne',
};
