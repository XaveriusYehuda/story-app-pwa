import AllStoryView from '../../views/pages/all-story-view';
import AddStoryPageView from '../../views/pages/add-story-view';
import DetailStoryPageView from '../../views/pages/detail-story-view';
import LoginPageView from '../../views/pages/login-page-view';
import RegisterPageView from '../../views/pages/register-page-view';

const routes = {
  '/': new AllStoryView(),
  '/detail/:id': new DetailStoryPageView(),
  '/login': new LoginPageView(),
  '/register': new RegisterPageView(),
  '/add': new AddStoryPageView(),
};

export default routes;