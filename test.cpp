#include <string>
#include <mutex>
#include <stdexcept>

int main() {
    std::string s = "hello";
    std::mutex m;
    throw std::runtime_error(s);
}
