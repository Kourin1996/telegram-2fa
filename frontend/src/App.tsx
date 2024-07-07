import IndexPage from "@/pages/index";
import SignPage from "@/pages/sign"

const App = () => {
  const queryParams = new URLSearchParams(window.location.search)
  const queryOp = queryParams.get('page')!;

  if (queryOp === 'sign') {
    return <SignPage />;
  }

  return <IndexPage />
}

export default App;
